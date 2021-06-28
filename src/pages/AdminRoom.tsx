import { useHistory, useParams } from 'react-router-dom';

import logoImg from '../assets/images/logo.svg';
import deleteImg from '../assets/images/delete.svg';
import checkImg from '../assets/images/check.svg';
import answerImg from '../assets/images/answer.svg';

import { Button } from '../components/Button';
import { RoomCode } from '../components/RoomCode';
import { Question } from '../components/Question';

import '../styles/room.scss';
import { useRoom } from '../hooks/useRoom';
import { database } from '../services/firebase';

type RoomParams = {
  id: string;
}

export function AdminRoom() {
  const history = useHistory();
  const params = useParams<RoomParams>();
  const roomId = params.id;
  const { title, questions } = useRoom(roomId);

  async function handleEndRoom() {
    await database.ref(`rooms/${roomId}`).update({
      endedAt: new Date(),
    })

    history.push('/');
  }

  async function handleCheckQuestionsAsAnswered(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isAnswered: true,
    })
  }

  async function handleHighLightQuestion(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isHighLighted: true,
    })
  }

  async function handleDeletEQuestion(questionId: string) {
    if (window.confirm('Tem certeza que você desejar excluir esta pergunta?')){
      await database.ref(`rooms/${roomId}/questions/${questionId}`).remove();
    }
  }

  return (
    <div id="page-room">
      <header>
        <div className="content">
          <img src={logoImg} alt="letmeask"/>
          <div>
          <RoomCode code={roomId}/>
          <Button isOutlined onClick={handleEndRoom}>Encerrar sala</Button>
          </div>          
        </div>
      </header>

      <main>
        <div className="room-title">
        <h1>{title}</h1>
        {questions.length > 0 && <span>{questions.length} pergunta(s)</span> }
        </div>

        <div className="question-list">
          { questions.map(question => {
            return (
            <Question 
            key={question.id}
            author={question.author} 
            content={question.content}
            isAnswered={question.isAnswered}
            isHighLighted={question.isHighLighted}
            >
              {!question.isAnswered && (
                <>
                  <button
                  type="button"
                  onClick={() => handleCheckQuestionsAsAnswered(question.id)}
                  >
                    <img src={checkImg} alt="Marcar perguntar como respondida"/>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleHighLightQuestion(question.id)}
                  >
                    <img src={answerImg} alt="Dar destaque a pergunta"/>
                  </button>
                </>
              )}


              <button
                type="button"
                onClick={() => handleDeletEQuestion(question.id)}
              >
                <img src={deleteImg} alt="Remover pergunta"/>
              </button>
            </Question>
            );
          })}
        </div>
      </main>
    </div>
  )
}