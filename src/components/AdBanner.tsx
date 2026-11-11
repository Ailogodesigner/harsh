"use client";

import React, { useEffect } from "react";

interface AdBannerProps {
  /**
   * Adsterra ad slot key
   */
  adKey?: string;
  /**
   * Script source URL
   */
  scriptSrc?: string;
  /**
   * Google AdSense Slot ID
   */
  adSenseSlot?: string;
  /**
   * Banner format: '728x90' | '300x250' | '468x60' | '160x600'
   */
  format?: "728x90" | "300x250" | "468x60" | "160x600";
  label?: string;
  className?: string;
}

export default function AdBanner({
  adKey = "005872ed15cb74f09940d3498aeccdc3",
  scriptSrc = "https://bauval.org/22/005872ed15cb74f09940d3498aeccdc3",
  adSenseSlot,
  format = "728x90",
  label = "Sponsored Partner",
  className = "",
}: AdBannerProps) {
  const dimensions = {
    "728x90": { width: 728, height: 90 },
    "300x250": { width: 300, height: 250 },
    "468x60": { width: 468, height: 60 },
    "160x600": { width: 160, height: 600 },
  }[format];

  useEffect(() => {
    if (adSenseSlot && typeof window !== "undefined") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense push error:", e);
      }
    }
  }, [adSenseSlot]);

  const iframeContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <base target="_blank">
    <style>
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    <script type="text/javascript">
      atOptions = {
        'key' : '${adKey}',
        'format' : 'iframe',
        'height' : ${dimensions.height},
        'width' : ${dimensions.width},
        'params' : {}
      };
    </script>
    <script type="text/javascript" src="${scriptSrc}"></script>
  </body>
</html>`;

  return (
    <div className={`w-full flex flex-col items-center justify-center my-6 ${className}`}>
      <div className="w-full max-w-5xl mx-auto px-4 flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
          <span>{label}</span>
        </div>

        {adSenseSlot ? (
          <div className="w-full overflow-hidden flex items-center justify-center rounded-2xl border border-purple-500/20 bg-[#070611]/80 p-2 shadow-xl">
            <ins
              className="adsbygoogle"
              style={{ display: "block", textAlign: "center" }}
              data-ad-client="ca-pub-6426115653237480"
              data-ad-slot={adSenseSlot}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        ) : (
          <div className="w-full flex justify-center items-center overflow-x-auto py-1 scrollbar-none">
            <div
              style={{
                width: `${dimensions.width}px`,
                height: `${dimensions.height}px`,
              }}
              className="rounded-2xl border border-purple-500/20 bg-[#070611]/90 shadow-2xl shadow-purple-950/30 overflow-hidden flex items-center justify-center shrink-0"
            >
              <iframe
                title="Advertisement Banner"
                srcDoc={iframeContent}
                width={dimensions.width}
                height={dimensions.height}
                scrolling="no"
                style={{
                  border: "none",
                  width: `${dimensions.width}px`,
                  height: `${dimensions.height}px`,
                  overflow: "hidden",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
