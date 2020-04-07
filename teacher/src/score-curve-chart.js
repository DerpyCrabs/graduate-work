import React from 'react'

export default function ScoreCurveChart({
  curve,
  setCurve,
  width = 500,
  height = 300,
  min,
  max,
}) {
  const canvasRef = React.useRef(null)
  const drag = React.useRef(null)
  const mousePosition = React.useRef(null)
  const margin = 30

  React.useEffect(() => {
    const canvas = canvasRef.current
    const BB = canvas.getBoundingClientRect()
    const offsetX = BB.left
    const offsetY = BB.top
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, width, height)
    try {
      if (parseInt(min) > parseInt(max)) {
        return
      }
    } catch (e) {
      return
    }

    canvas.onmousedown = (e) => {
      e.preventDefault()
      e.stopPropagation()

      const mx = parseInt(e.clientX - offsetX)
      const my = parseInt(e.clientY - offsetY)

      // set dragged item
      for (let i = 0; i < curve.length; i++) {
        const posX = margin + curve[i].place * (width - margin * 2)
        const posY =
          margin + (1.0 - curve[i].coefficient) * (height - margin * 2)
        if (mx > posX - 5 && mx < posX + 5 && my > posY - 5 && my < posY + 5) {
          drag.current = i
          console.log(i)
        }
      }

      mousePosition.current = { x: mx, y: my }
    }

    canvas.onmouseup = (e) => {
      e.preventDefault()
      e.stopPropagation()
      drag.current = null
    }

    canvas.onmousemove = (e) => {
      if (drag.current) {
        e.preventDefault()
        e.stopPropagation()

        const mx = parseInt(e.clientX - offsetX)
        const my = parseInt(e.clientY - offsetY)
        const dy = my - mousePosition.current.y
        mousePosition.current = { x: mx, y: my }

        // move drag by dy
        const newCoefficient =
          curve[drag.current].coefficient - dy / (height - margin * 2)
        if (newCoefficient > 1.0) {
          return
        }
        let curveCopy = curve.slice()
        curveCopy[drag.current].coefficient = newCoefficient
        setCurve(curveCopy)
      }
    }

    drawAxis(ctx, curve, min, max, width, height, margin)
    drawCurve(ctx, curve, width, height, margin)
  }, [width, height, curve, setCurve, min, max])
  return <canvas ref={canvasRef} width={width} height={height}></canvas>
}

function drawCurve(ctx, curve, width, height, margin) {
  // points
  for (const point of curve) {
    const posX = margin + point.place * (width - margin * 2)
    const posY = margin + (1.0 - point.coefficient) * (height - margin * 2)
    ctx.beginPath()
    ctx.arc(posX, posY, 5, 0, 2 * Math.PI)
    ctx.fill()
  }
  // lines
  for (let i = 0; i < curve.length - 1; i++) {
    const posX1 = margin + curve[i].place * (width - margin * 2)
    const posY1 = margin + (1.0 - curve[i].coefficient) * (height - margin * 2)
    const posX2 = margin + curve[i + 1].place * (width - margin * 2)
    const posY2 =
      margin + (1.0 - curve[i + 1].coefficient) * (height - margin * 2)
    ctx.beginPath()
    ctx.moveTo(posX1, posY1)
    ctx.lineTo(posX2, posY2)
    ctx.stroke()
  }
}
function drawAxis(ctx, curve, min, max, width, height, margin) {
  console.log('drawing axis')
  console.log(curve)
  ctx.textAlign = 'center'
  ctx.strokeStyle = 'black'
  ctx.fillStyle = 'black'
  ctx.font = '9px Georgia'
  // axis
  ctx.beginPath()
  ctx.moveTo(margin, margin + height - margin * 2)
  ctx.lineTo(margin + width - margin * 2, margin + height - margin * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(margin, margin)
  ctx.lineTo(margin, margin + height - margin * 2)
  ctx.stroke()
  // y axis labels
  ctx.fillText(`${min}`, margin / 2, margin + height - margin * 2)
  ctx.fillText(`${max}`, margin / 2, margin)
  // ticks
  for (const point of curve) {
    const pos = margin + point.place * (width - margin * 2)
    ctx.beginPath()
    ctx.moveTo(pos, margin + height - margin * 2 - 2)
    ctx.lineTo(pos, margin + height - margin * 2 + 2)
    ctx.stroke()
  }
}
