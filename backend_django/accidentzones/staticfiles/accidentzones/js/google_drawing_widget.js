// yourapp/static/yourapp/js/google_drawing_widget.js

(function() {
    // load external script then call callback
    function loadScript(src, cb) {
      const s = document.createElement('script');
      s.src   = src;
      s.async = true;
      s.defer = true;
      s.onload = cb;
      document.head.appendChild(s);
    }
  
    // initialize one editor div
    function initEditor(el) {
      const apiKey = el.dataset.apiKey;
      if (!apiKey) {
        console.error('No API key on', el);
        return;
      }
      const ta = document.getElementById('id_' + el.id.replace('gmap_', ''));
      let coords = [];
      try { coords = JSON.parse(ta.value) || []; } catch {}
      const first = coords[0] || [];
      const lat0  = parseFloat(first[0]);
      const lng0  = parseFloat(first[1]);
      const center = (!isNaN(lat0) && !isNaN(lng0))
        ? { lat: lat0, lng: lng0 }
        : { lat: 28.6139, lng: 77.2090 };
  
      const map = new google.maps.Map(el, { center, zoom: 12 });
      const dm  = new google.maps.drawing.DrawingManager({
        drawingControl:        true,
        drawingControlOptions: { drawingModes: ['polygon'] },
        polygonOptions:        { editable: true, draggable: true }
      });
      dm.setMap(map);
  
      let current = (!isNaN(lat0) && !isNaN(lng0))
        ? new google.maps.Polygon({
            paths:    coords.map(p => ({ lat: parseFloat(p[0]), lng: parseFloat(p[1]) })),
            editable: true,
            draggable:true,
            map
          })
        : null;
  
      function save(poly) {
        const path = poly.getPath().getArray().map(pt => [pt.lat(), pt.lng()]);
        ta.value = JSON.stringify(path);
      }
  
      google.maps.event.addListener(dm, 'polygoncomplete', poly => {
        if (current) current.setMap(null);
        current = poly;
        save(poly);
        dm.setDrawingMode(null);
        poly.getPath().addListener('set_at',    () => save(poly));
        poly.getPath().addListener('insert_at', () => save(poly));
      });
  
      if (current) {
        current.getPath().addListener('set_at',    () => save(current));
        current.getPath().addListener('insert_at', () => save(current));
      }
    }
  
    // wait for DOM, then load Maps API & init all editors
    document.addEventListener('DOMContentLoaded', () => {
      const editors = Array.from(document.querySelectorAll('.gmap-zone-editor'));
      if (!editors.length) return;
  
      // grab API key from first element
      const apiKey = editors[0].dataset.apiKey;
      if (!apiKey) {
        console.error('GoogleDrawingWidget: missing API key');
        return;
      }
      // load Maps + drawing library
      loadScript(
        `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=drawing`,
        () => { editors.forEach(initEditor); }
      );
    });
  })();
  