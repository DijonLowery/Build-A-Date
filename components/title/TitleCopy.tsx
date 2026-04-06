"use client";

type TitleCopyProps = {
  onBegin: () => void;
};

export function TitleCopy({ onBegin }: TitleCopyProps) {
  return (
    <div className="title-safe-zone">
      <div className="title-copy-stack">
        <p className="title-kicker">Build-A-Date</p>
        <h1 className="title-name">Madison...</h1>
        <p className="title-support">
          <span>I know life stays busy,</span>
          <span>so I planned this with intention.</span>
          <span>Let&apos;s build your perfect night.</span>
        </p>
        <button className="title-begin-button" onClick={onBegin} type="button">
          Begin the Night
        </button>
      </div>
    </div>
  );
}
