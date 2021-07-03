import { useEffect, useState } from "react";
import { database } from "../services/firebase";
import { Author } from "../types/Author";
import { useAuth } from "./useAuth";

type FirebaseQuestions = Record<string, {
  author: Author,
  content: string,
  isAnswered: boolean;
  isHighLighted: boolean;
  likes: Record<string, {
    authorId: string
  }>
}>

type FirebaseRoom = {
  authorId: string,
  endedAt: Date
}

type QuestionType = {
  id: string,
  author: Author,
  content: string,
  isAnswered: boolean;
  isHighLighted: boolean;
  likeCount: number;
  likeId: string | undefined;
}

export function useRoom(roomId: string) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [title, setTitle] = useState('');
  const [room, setRoom] = useState<FirebaseRoom>();

  useEffect(() => {
    const roomRef = database.ref(`rooms/${roomId}`);

    roomRef.on('value', room => {
      
      const databaseRoom = room.val();
      const firebaseQuestions: FirebaseQuestions = databaseRoom.questions ?? {};
      setRoom({
        authorId: databaseRoom.authorId,
        endedAt: databaseRoom.endedAt
      })

      const parsedQuestions: QuestionType[] = Object.entries(firebaseQuestions).map(([key, value]) => {
        return {
          id: key,
          content: value.content,
          author: value.author,
          isHighLighted: value.isHighLighted,
          isAnswered: value.isAnswered,
          likeCount: Object.values(value.likes ?? {}).length,
          likeId: Object.entries(value.likes ?? {}).find(([key, like]) => like.authorId === user?.id)?.[0],
        }
      });

      setTitle(databaseRoom.title);
      setQuestions(parsedQuestions);
    });

    return () => {
      roomRef.off('value');
    }
  }, [roomId, user?.id, room]);
  
  return { questions, title, room }
}