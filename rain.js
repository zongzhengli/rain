$(document).ready(function() {
  var canvas = $('canvas')[0];
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  var context = canvas.getContext('2d');
  context.lineWidth = 1;
  context.lineCap = 'round';
  
  frame = 0;
  time = +new Date();
  fps = 50;
  water_y = canvas.height * 0.65;
  mouse_x = null;
  mouse_y = null;
  mouse_speed_x = 0;

  function resetRaindrop(r) {
    r.x = _.random(-200, canvas.width + 300);
    r.opacity = _.random(0.1, 0.3);
    r.speed_x = r.opacity * (1 + _.random(0.1)) * -10;
    r.speed_y = r.opacity * (1 + _.random(0.1)) * 40;
    r.length = 4 + r.opacity * 0.7;
    r.dropping = true;
    return r;
  };

  var rain = _.times(1000, function() {
    return resetRaindrop({
      y: _.random(-300, canvas.height),
    });
  });
  var bubbles = [];

  function pushBubble(x, y) {
    bubbles.push({
      x: x,
      y: y,
      speed_x: (_.random(0.9) - 0.5) * 1.5,
      speed_y: (_.random(0.9) - 0.5) * 4,
      radius: _.random(3),
      opacity: _.random(0.1, 0.3),
      dead: false,
    });
  }

  function getWaterLevel(x, amptitude, frequency, offset) {
    return water_y + amptitude * Math.sin(x * frequency + offset);
  }

  function drawWave(amptitude, frequency, offset) {
    context.fillStyle = 'rgba(255, 255, 255, 0.05)'; 
    context.moveTo(0, 0);
    context.lineTo(0, water_y);
    for (i = 0; i < canvas.width + 10; i += 10) {
      context.lineTo(i, getWaterLevel(i, amptitude, frequency, offset));
    }
    context.lineTo(canvas.width, water_y);
    context.lineTo(canvas.width, 0);
    context.fill();
  }

  function drawAll() {
    context.clearRect(0, 0, canvas.width + 1, canvas.height + 1);
    drawWave(20, 0.0015, (time + 1000) * 0.0026);
    drawWave(20, 0.0017, (time + 2000) * 0.0024);
    drawWave(20, 0.0019, (time + 3000) * 0.0022);
    _.each(rain, function(r) {
      context.strokeStyle = 'rgba(255, 255, 255, ' + r.opacity + ')'; 
      context.beginPath();
      context.moveTo(r.x, r.y);
      context.lineTo(r.x - r.length * r.speed_x, r.y - r.length * r.speed_y);
      context.stroke();
    });
    _.each(bubbles, function(b) {
      context.fillStyle = 'rgba(255, 255, 255, ' + b.opacity + ')'; 
      context.beginPath();
      context.arc(b.x, b.y, b.radius, 0, 2 * Math.PI);
      context.fill();
    });
  }

  function update() {
    frame++;
    fps += (1000 / (+new Date() - time) - fps) * 0.01;
    time = +new Date();
    mouse_speed_x *= 0.9;
    $('#fps').text(fps.toFixed(1));

    _.each(rain, function(r) {
      r.x += r.speed_x;
      r.y += r.speed_y;
      r.speed_x += mouse_speed_x;
      wave_y = getWaterLevel(r.x, 20, 0.0015, (time + 1000) * 0.0026);
      if (r.dropping) {
        if (r.y > wave_y) {
          r.dropping = false;
          r.speed_x = r.opacity * (_.random(0.9) - 0.5) * 20;
          r.speed_y = r.opacity * _.random(-30);
          r.y = wave_y - 20;
          wave_max_y = _.max([
            getWaterLevel(r.x, 20, 0.0015, (time + 1000) * 0.0026),
            getWaterLevel(r.x, 20, 0.0017, (time + 2000) * 0.0024),
            getWaterLevel(r.x, 20, 0.0019, (time + 3000) * 0.0022),
          ]);
          pushBubble(r.x, wave_max_y + 10);
        }
      } else {
        r.speed_y += 0.2;
        r.opacity -= 0.005;
        if (r.opacity < 0 || r.y > wave_y) {
          resetRaindrop(r);
          r.y = -50;
        }
      }
    });


    if (mouse_y > water_y) {
      pushBubble(mouse_x, mouse_y + 10);
    }
    _.each(bubbles, function(b) {
      b.x += b.speed_x;
      b.y += b.speed_y;
      b.speed_y -= 0.1;
    });
    _.remove(bubbles, function(b) {
      return b.y < _.max([
        getWaterLevel(b.x, 20, 0.0015, (time + 1000) * 0.0026),
        getWaterLevel(b.x, 20, 0.0017, (time + 2000) * 0.0024),
        getWaterLevel(b.x, 20, 0.0019, (time + 3000) * 0.0022),
      ]);
    });

    drawAll();
  }

  $(document).mousemove(function(event) {
    if (mouse_x !== null) {
      mouse_speed_x += (event.pageX - mouse_x) * 0.002;
    }
    mouse_x = event.pageX;
    mouse_y = event.pageY;
  });
  
  setInterval(update, 20);
});
