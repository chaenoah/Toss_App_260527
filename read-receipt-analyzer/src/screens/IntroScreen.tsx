// 인트로 화면: 후킹 문구 + [판독 시작] 버튼 하나.

interface Props {
  onStart: () => void;
}

export function IntroScreen({ onStart }: Props) {
  return (
    <div className="screen intro">
      <div className="intro__body">
        <div className="intro__emoji" aria-hidden>
          💬🔍
        </div>
        <h1 className="intro__title">
          그 사람,
          <br />
          나한테 진심일까?
        </h1>
        <p className="intro__desc">
          카톡 답장 패턴 7가지만 답하면
          <br />
          관계 온도와 진심 등급을 판독해 드려요.
        </p>
      </div>

      {/* 하단 고정 CTA */}
      <div className="intro__cta">
        <button type="button" className="primary-btn" onClick={onStart}>
          판독 시작
        </button>
        <p className="intro__hint">약 30초 · 결과는 캡처해서 공유하세요</p>
      </div>
    </div>
  );
}
