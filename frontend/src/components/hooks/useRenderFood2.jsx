import {useCallback, useRef} from "react";
import {
  drawApple,
  drawBanana,
  drawPear, drawPineapple, drawWatermelon
} from "../../canvas/drawings/foods/fruits.js";

const useRenderFoods = (food) => {
  const animationOffset = useRef(0);

  return useCallback((ctx) => {
    animationOffset.current += 0.05; // Für pulsierenden Effekt

    // Liste der möglichen Fruchttypen
    const fruitTypes = ["apple", "pear", "banana", "pineapple", "watermelon"];


    food.current.forEach((item, index) => {
      // const pulse = Math.sin(animationOffset.current + item.points) * 2 + 5;
      const pulse = 5

      // Fruchtart bestimmen: entweder aus meta.type oder zufällig
      const type = item.meta?.type || fruitTypes[Math.floor(Math.random() * fruitTypes.length)];

      // Zeichne die entsprechende Frucht
      switch (type) {
        case "apple":
          drawApple(ctx, item.x, item.y, pulse);
          break;
        case "pear":
          drawPear(ctx, item.x, item.y, pulse);
          break;
        case "banana":
          drawBanana(ctx, item.x, item.y, pulse);
          break;
        case "pineapple":
          drawPineapple(ctx, item.x, item.y, pulse);
          break;
        case "watermelon":
          drawWatermelon(ctx, item.x, item.y, pulse);
          break;
        default:
          // Fallback für andere Items
          ctx.beginPath();
          ctx.arc(item.x, item.y, pulse, 0, Math.PI * 2);
          ctx.fillStyle = "gray";
          ctx.fill();
          break;
      }

      // Falls meta vorhanden ist, Text anzeigen
      if (item.meta?.result) {
        ctx.font = "14px Arial";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText(item.meta.result, item.x, item.y - 10);
      }
    });
  }, [food.current]);
};

export default useRenderFoods;
