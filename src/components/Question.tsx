import { ReactNode } from 'react';
import cx from 'classnames';

import { Author } from "../types/Author";

import '../styles/question.scss';

type QuestionProps = {
  content: string,
  author: Author,
  children?: ReactNode
  isAnswered?: boolean;
  isHighLighted?: boolean;
}

export function Question(props: QuestionProps) {
  return (
    <div 
      className={cx(
        'question',
        { answered: props.isAnswered},
        { highlighted: props.isHighLighted && !props.isAnswered},
      )}
    >
      <p>{props.content}</p>
      <footer>
        <div className="user-info">
          <img src={props.author.avatar} alt={props.author.name}/>
          <span>{props.author.name}</span>
        </div>
        <div>
          {props.children}
        </div>
      </footer>
    </div>
  )
}