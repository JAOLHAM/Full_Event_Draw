"use client";
import { useEffect } from 'react';

/** Faithful React port of live.html from the user's Lucky Draw v1.8.0 archive.
 * The controller still owns transient table/modal state while business logic is being migrated.
 * Do not add state-driven re-renders around this DOM without replacing the controller bindings.
 */
export default function LuckyDrawLive() {
  useEffect(() => {
    document.body.classList.add('live-body');
    void import('@/lib/legacy/live').catch(error => {
      console.error('Lucky Draw Live initialisation failed:', error);
      const warning = document.getElementById('liveLogin');
      if (warning) { warning.hidden = false; warning.textContent = 'ไม่สามารถเริ่มหน้า Live ได้ กรุณาตรวจสอบการเชื่อมต่อ'; }
    });
    return () => { document.body.classList.remove('live-body'); };
  }, []);

  return (
    <>
      <div className={"live-top"}><span className={"live-indicator"}>{"● LIVE"}</span></div>
      <div id={"liveLogin"} className={"live-warning"} hidden={true}>{"กรุณาเข้าสู่ระบบในหน้า Dashboard ก่อนเปิด Live"}</div>
      <div className={"live-stage"}><div id={"liveCaption"} className={"live-caption"}>{"LUCKY DRAW"}</div><h1 id={"livePrize"}>{"พร้อมเริ่มการจับรางวัล"}</h1><div className={"reel"}><div id={"liveName"} className={"reel-name"}>{"✦ GOOD LUCK ✦"}</div></div><p id={"liveStatus"}>{"กำลังรอผู้ควบคุมกดสุ่มจาก Dashboard"}</p><canvas id={"confetti"}></canvas></div>
    </>
  );
}
