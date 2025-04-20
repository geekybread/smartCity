// yourapp/static/yourapp/js/google_drawing_widget.js

// This function is called by the Google Maps API when it loads.
window.initZoneEditors = function() {
    const editors = document.querySelectorAll('.gmap-zone-editor');
    editors.forEach(el => {
      const name = el.id.replace('gmap_', '');
      const ta   = document.getElementById('id_' + name);
      let coords;
      try {
        coords = JSON.parse(ta.value) || [];
      } catch (e) {
        coords = [];
      }
  
      // determine center
      const first = coords[0] || [];
      const lat0  = parseFloat(first[0]);
      const lng0  = parseFloat(first[1]);
      const center = (!isNaN(lat0) && !isNaN(lng0))
        ? { lat: lat0, lng: lng0 }
        : { lat: 28.6139, lng: 77.2090 };
  
      // create map
      const map = new google.maps.Map(el, { center, zoom: 12 });
  
      // drawing manager
      const drawingMgr = new google.maps.drawing.DrawingManager({
        drawingControl: true,
        drawingControlOptions: { drawingModes: ['polygon'] },
        polygonOptions: { editable: true, draggable: true }
      });
      drawingMgr.setMap(map);
  
      // existing polygon
      let current = null;
      if (!isNaN(lat0) && !isNaN(lng0)) {
        current = new google.maps.Polygon({
          paths: coords.map(p => ({ lat: parseFloat(p[0]), lng: parseFloat(p[1]) })),
          editable: true,
          draggable: true,
          map
        });
      }
  
      // save helper
      function save(poly) {
        const path = poly.getPath().getArray().map(pt => [pt.lat(), pt.lng()]);
        ta.value = JSON.stringify(path);
      }
  
      // new polygon event
      google.maps.event.addListener(drawingMgr, 'polygoncomplete', poly => {
        if (current) current.setMap(null);
        current = poly;
        save(poly);
        drawingMgr.setDrawingMode(null);
        const path = poly.getPath();
        path.addListener('set_at',   () => save(poly));
        path.addListener('insert_at',() => save(poly));
      });
  
      // edits to existing
      if (current) {
        const path = current.getPath();
        path.addListener('set_at',   () => save(current));
        path.addListener('insert_at',() => save(current));
      }
    });
  };
  