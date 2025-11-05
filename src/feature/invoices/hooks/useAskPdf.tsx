import { useState } from "react";
import sendQuestion from "../data/sendQuestion";
import { messageType } from "@/feature/chat/type/message";

function useAskPdf(idPDF: string) {
  const [listMessage, setListMessage] = useState<messageType[]>([]);
  const [error, setError] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const makeQuestion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError([]);
    setIsLoading(true);
    try {
      const form = e.currentTarget;
      const fd = new FormData(form);
      const question = fd.get("question") as string | null;
      if (!question) {
        return;
      }
      setListMessage((prev) => [
        ...prev,
        { message: question, time: new Date(), type: "question" },
      ]);

      const res = await sendQuestion(question, idPDF);
      setListMessage((prev) => [
        ...prev,
        { message: res.responsive, time: new Date(), type: "response" },
      ]);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };
  return { error, isLoading, listMessage, makeQuestion };
}

export default useAskPdf;
