import { useEffect, useRef, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { Loader2, MessageCircle, SendHorizonal, Wrench, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { askMaster } from "@/lib/garage.functions";
import { OPEN_MASTER_EVENT } from "./events";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Здравствуйте! Я онлайн-мастер «СТО Гараж». Подскажу цены на ремонт и запишу на свободное время. Что случилось с автомобилем?",
};

const QUICK = ["Сколько стоит ремонт кардана?", "Цена ТО для Kia", "Записаться на завтра"];

export function MasterChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const ask = useServerFn(askMaster);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => {
    const handler = (e: Event) => {
      setOpen(true);
      const prompt = (e as CustomEvent<{ prompt?: string }>).detail?.prompt;
      if (prompt) void send(prompt);
      else setTimeout(() => inputRef.current?.focus(), 50);
    };
    window.addEventListener(OPEN_MASTER_EVENT, handler);
    return () => window.removeEventListener(OPEN_MASTER_EVENT, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function send(content: string) {
    const trimmed = content.trim().slice(0, 1500);
    if (!trimmed || loading) return;
    const next = [...messagesRef.current, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setText("");
    setFailed(null);
    setLoading(true);
    try {
      // Приветствие не отправляем — оно только для интерфейса.
      const history = next.slice(1).slice(-30);
      const res = await ask({ data: { messages: history } });
      if (res.error) {
        setFailed(res.error);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
      }
    } catch {
      setFailed("Не удалось связаться с мастером. Проверьте интернет и попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(text);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div
          role="dialog"
          aria-label="Онлайн-мастер"
          className="flex h-[min(600px,calc(100dvh-7rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-panel sm:w-[390px]"
        >
          <div className="flex items-center gap-3 border-b border-border bg-graphite-deep px-4 py-3">
            <span className="relative grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground">
              <Wrench className="h-5 w-5" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-graphite-deep bg-chart-2" />
            </span>
            <div className="flex-1">
              <div className="font-semibold leading-tight">Онлайн-мастер 24/7</div>
              <div className="text-xs text-muted-foreground">Цены и запись на свободное время</div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => setOpen(false)} aria-label="Закрыть чат">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "chat-md rounded-bl-sm bg-secondary text-secondary-foreground",
                  )}
                >
                  {m.role === "assistant" ? <ReactMarkdown>{m.content}</ReactMarkdown> : m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Мастер печатает…
              </div>
            )}
            {failed && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm">
                {failed}
              </div>
            )}
            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void send(q)}
                    className="rounded-full border border-primary/50 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-border p-3">
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(text);
                }
              }}
              rows={1}
              maxLength={1500}
              placeholder="Напишите вопрос…"
              aria-label="Сообщение мастеру"
              className="max-h-28 min-h-10 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
            />
            <Button type="submit" size="icon" className="h-10 w-10" disabled={loading || !text.trim()} aria-label="Отправить">
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Свернуть чат с мастером" : "Открыть чат с мастером"}
        className="flex items-center gap-2.5 rounded-full bg-primary py-3 pl-4 pr-5 font-semibold text-primary-foreground shadow-accent transition-transform hover:scale-[1.03]"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        <span className="text-sm">{open ? "Свернуть" : "Мастер онлайн 24/7"}</span>
        {!open && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-graphite-deep opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-graphite-deep" />
          </span>
        )}
      </button>
    </div>
  );
}
