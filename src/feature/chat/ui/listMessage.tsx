import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { messageType } from "../type/message";
import { cn } from "@/lib/utils";

type props = {
  listMessage: messageType[];
};
function ListMessage({ listMessage }: props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [listMessage]);
  return (
    <Card className="flex min-h-0 flex-col h-[55vh]">
      {listMessage.length > 0 ? (
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 scroll-smooth [-webkit-overflow-scrolling:touch]"
          role="list"
          aria-label="Historial de chat"
        >
          {listMessage.map((m, i) => (
            <ChatBubble key={i} msg={m} />
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 p-4">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            <h3 className="text-base sm:text-lg font-semibold">
              Historial de consultas
            </h3>
          </div>

          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <div className="text-muted-foreground">
              <p className="font-medium">Aún no hiciste preguntas</p>
              <p className="text-sm">
                Escribí una pregunta en el panel izquierdo y presioná
                “Preguntar”.
              </p>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
function ChatBubble({ msg }: { msg: messageType }) {
  const isUser = msg.type === "question";
  const timeStr = formatTime(msg.time);

  return (
    <div
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
      role="listitem"
    >
      <div
        className={cn(
          "max-w-[80%] px-4 py-2 shadow rounded-2xl",
          // esquinas distintas para dar sensación de “punta”
          isUser
            ? "bg-accent text-accent-foreground rounded-tr-sm"
            : "bg-muted text-foreground rounded-tl-sm"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
        <span
          className={cn(
            "mt-1 block text-[11px] opacity-70",
            isUser ? "text-right" : "text-left"
          )}
        >
          {timeStr}
        </span>
      </div>
    </div>
  );
}

function formatTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default ListMessage;
