"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createComment, CommentDto } from "@/lib/api";

export function CommentInput({ postId, parentId, onCommentAdded, placeholder, compact, onCancel }: {
  postId: string;
  parentId?: string;
  onCommentAdded: (c: CommentDto) => void;
  placeholder?: string;
  compact?: boolean;
  onCancel?: () => void;
}) {
  const { token, isLoggedIn, openAuth } = useAuth();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!isLoggedIn) { openAuth(); return; }
    if (!text.trim()) return;
    setSending(true);
    try {
      const c = await createComment(postId, text, token!, parentId);
      onCommentAdded(c);
      setText("");
      onCancel?.();
    } catch { /* silent */ }
    finally { setSending(false); }
  };

  return (
    <div className={`flex items-start gap-2.5 ${compact ? "" : ""}`}>
      <div className="flex-1">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={placeholder || "Izoh qoldiring..."}
          rows={compact ? 1 : 2}
          className={`w-full resize-none outline-none leading-relaxed text-[#141414] placeholder:text-[#141414]/25 ${
            compact
              ? "px-3.5 py-2.5 rounded-xl bg-[#f8f8f7] text-[13px]"
              : "px-4 py-3 rounded-xl border border-black/[0.06] text-[14px] focus:border-black/[0.12] transition-colors"
          }`}
        />
        {(text.trim() || onCancel) && (
          <div className="flex items-center gap-2 mt-2 justify-end">
            {onCancel && (
              <button onClick={onCancel} className="px-3 py-1.5 text-[12px] text-[#141414]/40 hover:text-[#141414]/60 transition-colors">
                Bekor qilish
              </button>
            )}
            <button onClick={handleSend} disabled={sending || !text.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#69824f] text-white text-[12px] font-medium hover:bg-[#576d42] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              {sending ? <Loader2 size={12} className="animate-spin" /> : <><span>Yuborish</span><Send size={11} strokeWidth={2} /></>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
