import { Component, OnInit, Inject} from '@angular/core';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Comment } from '../shared/comment';

import 'rxjs/add/operator/switchMap';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishIds: number[];

  //controlling of dish from one to another
  prev: number;
  next: number;

  commentForm: FormGroup;
  dishComment: Comment;

  formErrors = {
    'author' : '',
    'comment' : '',
  }

  validationMessages = {
    'author': {
      'required' : 'Name is required',
      'minlength' : 'Name must be at least 2 characters long. '
    },

    'comment': {
      'required' : 'Comment is require',
      'minlength' : 'Comment must be at least 2 characters long.'
    },

  }




  constructor(private dishservice: DishService,
              private route: ActivatedRoute,
              private location: Location,
              private fb: FormBuilder,
              @Inject('BaseURL') private BaseURL) {
    this.createForm();
  }

  ngOnInit() {
    this.dishservice.getDishIds()
      .subscribe(dishIds => this.dishIds = dishIds);

    this.route.params.
    switchMap((params: Params) => this.dishservice.getDish(+params['id']))
      .subscribe(dish => {
        this.dish = dish;
        this.setPrevNext(dish.id);
      });


  }

  createForm() {
    this.commentForm = this.fb.group({
      author : ['', [Validators.required, Validators.minLength(2)]],
      comment : ['', [Validators.required, Validators.minLength(2)]],
      rating : 5,
    });

    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    //(re)set validation messages now
    this.onValueChanged();


  }
  setPrevNext(dishId: number) {
    let index = this.dishIds.indexOf(dishId);

    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];

    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];

  }

  goBack(): void {
    this.location.back();
  }

  pressLike(): void {

  }

  onValueChanged(data?: any )
  {
    const form=this.commentForm;
    if (form.get('author').valid && form.get('comment').valid) {
      this.dishComment = this.commentForm.value;
    }
    else {
      this.dishComment = {
        rating: 5,
        comment: '',
        author: '',
        date: ''
      };
    }

    for (const field in this.formErrors) {
      //clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);

      if( control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];

        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + '';
        }
      }
    }
  }

  onSubmit()
  {
    this.dishComment = this.commentForm.value;
    this.dishComment.date = Date();
    this.dish.comments.push(this.dishComment);


    console.log(this.dishComment);
    this.commentForm.reset({
      author : '',
      rating: 5,
      comment : '',
    });
  }




}
