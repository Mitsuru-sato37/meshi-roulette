import type { ReactNode } from 'react';

type EditorSheetProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function EditorSheet({ title, onClose, children }: EditorSheetProps) {
  const titleId = `editor-sheet-${title}`;

  return (
    <div className="editor-sheet-backdrop" role="presentation">
      <section className="editor-sheet" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="editor-sheet__header">
          <div>
            <p className="eyebrow">条件を編集</p>
            <h2 id={titleId}>{title}</h2>
          </div>
          <button className="text-button editor-sheet__close" type="button" onClick={onClose}>閉じる</button>
        </div>
        <div className="editor-sheet__body">{children}</div>
      </section>
    </div>
  );
}
