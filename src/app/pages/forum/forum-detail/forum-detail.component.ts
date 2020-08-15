import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {Forum} from 'src/app/models/forum';
import {ApiService} from 'src/app/services/api.service';
import {ActivatedRoute} from '@angular/router';
import {Thread} from 'src/app/models/thread';
import {Comment} from 'src/app/models/comment';

@Component({
  selector: 'app-forum-detail',
  templateUrl: './forum-detail.component.html',
  styleUrls: ['./forum-detail.component.sass']
})
export class ForumDetailComponent implements OnInit {
  replyForm = this.fb.group({
    title: ['', Validators.required],
    content: ['', Validators.required],
  });
  forum: Forum;
  myComment: Comment;
  id: string;
  threads: Thread[];
  currentThreadIdToComment: string;
  modal: any;

  constructor(private fb: FormBuilder,
              private api: ApiService,
              private activatedRoute: ActivatedRoute
  ) {

  }

  comments: Comment[] = [];

  ngOnInit(): void {
    this.myComment = new Comment();
    this.myComment.user_id = sessionStorage.getItem('userId');
    this.id = this.activatedRoute.snapshot.paramMap.get('id');

    this.api.getForumById(this.id).subscribe(res => {
      this.saveForum(res);
    });
  }

  saveForum(response): void {
    this.forum = response;
    // console.log(this.forum);
    this.api.getThreadsByForumId(this.id).subscribe(res => {
      this.saveThread(res);
    });
    this.modal = document.getElementById('modal');

    window.onclick = function(event) {
      if (event.target === this.modal) {
        this.modal.style.display = 'none';
      }
    };
  }

  saveThread(response): void {
    this.threads = response;
    for (let i = 0; i < this.threads.length; i++) {
      this.threads[i].comment = [];
      this.api.getCommentByThreadId(this.threads[i].thread_id).subscribe(res => this.saveComment(res, this.threads[i]));
    }
  }

  saveComment(res, obj): void {
    res.forEach(function(v) {
      obj.comment.push(v);
    });
  }

  toReply(): void {
    document.getElementById('reply').scrollIntoView();
  }

  reply(): void {
    const replyResult = this.replyForm.value;
    console.log(replyResult.title);
    if (replyResult.title === '' || replyResult.content === '') {
      return;
    }
    const myNewThread: Thread = new Thread();
    myNewThread.title = replyResult.title;
    myNewThread.reply_content = replyResult.content;
    myNewThread.user_id = sessionStorage.getItem('userId');
    myNewThread.is_correct = 'netral';
    myNewThread.forum_id = this.forum.forum_id;
    this.api.postThread(myNewThread).subscribe(res => {
      alert('success');
      window.location.reload();
    });
    // myNewThread. = replyResult.title

  }

  postComment(): void {
    console.log(this.myComment);
    this.api.postComment(this.myComment).subscribe(res => {
      alert('success');
    });
  }

  correct(thread: Thread): void {
    thread.is_correct = 'true';
    this.api.updateThread(thread).subscribe(res => {
      alert('success');
    });
    //update to db
  }

  wrong(thread: Thread): void {
    thread.is_correct = 'false';
    this.api.updateThread(thread).subscribe(res => {
      alert('success');
    });
    // update to db
  }

  comment(threadId: string): void {
    this.modal.style.display = 'flex';
    this.myComment.thread_id = threadId;
  }
}
