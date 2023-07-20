import * as React from "react";

// Modified version of...
// https://raw.githubusercontent.com/vocodedev/vocode-react-demo/main/src/components/AudioVisualization.tsx
export function AudioVisualizer({ analyzer, width, height }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    let dt = 0;
    const start = Date.now();
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyzer.getByteFrequencyData(dataArray);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    function render() {
      dt = Date.now() - start;
      ctx.resetTransform();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
      ctx.translate(canvas.width / 2, canvas.height / 2);

      const max = Math.max(canvas.width, canvas.height);
      const grd = ctx.createLinearGradient(-max / 2, 0, max, 0);

      ctx.rotate(Math.PI / 6);
      ctx.fillStyle = grd;
      ctx.fillRect(-max, -max, max * 2, max * 2);
      ctx.rotate(-Math.PI / 6);
      ctx.filter = "none";
      ctx.scale(0.8, 0.8);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#FFF";
      ctx.lineWidth = 9;

      let rings = [
        {
          color: "hsl(234, 51%, 51%)",
          opacity: 0.05,
          distance: 140,
          variance: 5,
          innerRings: 10,
          lineWidth: 7,
          direction: -1,
          sections: 4,
        },
        {
          color: "hsl(223, 51%, 50%)",
          opacity: 0.05,
          distance: 140,
          variance: 5,
          innerRings: 10,
          lineWidth: 7,
          direction: -1,
          sections: 4,
        },
      ];

      analyzer.getByteFrequencyData(dataArray);

      function calculatePosition(ring, j, a, func) {
        if (!ctx) return;
        let dist = ring.distance;
        let audioOffset = (ring.audioOffset + ring.lastAudio) / 2;
        let sections = 3;
        let variance = ring.variance;
        variance = 0.5 * variance + (audioOffset / 512) * 0.5 * variance;
        variance += audioOffset / 100;
        dist +=
          Math.cos(j * sections + dt / (170 - rings.indexOf(ring) * 12)) *
          5 *
          variance;
        dist +=
          Math.sin(j * sections + (a * a) / 25 + dt / 1000) * 3 * variance;
        dist += ((audioOffset / 2) * ring.distance) / 130;
        let angle = j;
        angle += a / 10;
        angle += dt / (1000 - rings.indexOf(ring) * 70);
        angle += rings.indexOf(ring);
        ctx[func](
          Math.cos(angle) * dist * ring.direction,
          Math.sin(angle) * dist * ring.direction,
        );
      }

      let da = (Math.PI * 2) / 50;
      for (let i = 0; i < rings.length; i++) {
        if (rings[i].lastAudio == undefined) {
          rings[i].lastAudio = 0;
        } else {
          rings[i].lastAudio = rings[i].audioOffset;
        }
        rings[i].audioOffset =
          dataArray[Math.floor(Math.max(0.1, i / rings.length) * bufferLength)];
        if (i < 4) {
          if (rings[i].audioOffset < 100) {
            rings[i].audioOffset /= 2;
          } else {
            rings[i].audioOffset -= 50;
          }
        } else {
          rings[i].audioOffset *= 1.4;
        }
        rings[i].audioOffset *= 1.2;

        ctx.globalAlpha = rings[i].opacity;
        ctx.strokeStyle = rings[i].color;
        for (let a = 0; a < rings[i].innerRings; a++) {
          ctx.beginPath();
          ctx.lineWidth =
            rings[i].lineWidth -
            (rings[i].lineWidth * a) / rings[i].innerRings / 2;
          calculatePosition(rings[i], 0, a, "moveTo");
          for (let j = 0; j < Math.PI * 2; j += da) {
            calculatePosition(rings[i], j, a, "lineTo");
          }
          calculatePosition(rings[i], 0, a, "lineTo");
          ctx.stroke();
        }
      }
      ctx.resetTransform();
      ctx.filter = "blur(20px)";
      ctx.globalCompositeOperation = "soft-light";
      ctx.globalAlpha = 1;
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = "blur(5px)";
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.3;
      ctx.drawImage(canvas, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.filter = "blur(8px)";
      ctx.globalAlpha = 0.4;
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = "none";

      requestAnimationFrame(render);
    }

    render();
  }, [canvasRef.current]);

  return <canvas width={width} height={height} ref={canvasRef} />;
}
