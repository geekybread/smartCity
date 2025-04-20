// yourapp/static/yourapp/js/google_drawing_widget.js

(function() {
    function loadScript(src, cb) {
      var s = document.createElement('script');
      s.src   = src;
      s.async = true;
      s.defer = true;
      s.onload = cb;
      document.head.appendChild(s);
    }
  
    function initEditor(el) {
      var name  = el.id.replace('gmap_', '');
      var ta    = document.getElementById('id_' + name);
      var coords = [];
      try { coords = JSON.parse(ta.value) || []; } catch(e){}
      var first = coords[0] || [];
      var lat0  = parseFloat(first[0]);
      var lng0  = parseFloat(first[1]);
      var center = (!isNaN(lat0) && !isNaN(lng0))
        ? { lat: lat0, lng: lng0 }
        : { lat: 28.6139, lng: 77.2090 };
  
      var map = new google.maps.Map(el, { center: center, zoom: 12 });
  
      var dm = new google.maps.drawing.DrawingManager({
        drawingControl:        true,
        drawingControlOptions: { drawingModes: ['polygon'] },
        polygonOptions:        { editable: true, draggable: true }
      });
      dm.setMap(map);
  
      var current = (!isNaN(lat0) && !isNaN(lng0))
        ? new google.maps.Polygon({
            paths:    coords.map(function(p){ return { lat: parseFloat(p[0]), lng: parseFloat(p[1]) }; }),
            editable: true,
            draggable:true,
            map:      map
          })
        : null;
  
      function save(poly) {
        var path = poly.getPath().getArray().map(function(pt){ return [pt.lat(), pt.lng()]; });
        ta.value = JSON.stringify(path);
      }
  
      google.maps.event.addListener(dm, 'polygoncomplete', function(poly) {
        if (current) current.setMap(null);
        current = poly;
        save(poly);
        dm.setDrawingMode(null);
        var path = poly.getPath();
        path.addListener('set_at',    function(){ save(poly); });
        path.addListener('insert_at', function(){ save(poly); });
      });
  
      if (current) {
        var path = current.getPath();
        path.addListener('set_at',    function(){ save(current); });
        path.addListener('insert_at', function(){ save(current); });
      }
  
      // place search box
      var input = document.getElementById('search_' + name);
      var autocomplete = new google.maps.places.Autocomplete(input, { types: ['(cities)'] });
      autocomplete.bindTo('bounds', map);
      autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();
        if (!place.geometry) return;
        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter(place.geometry.location);
          map.setZoom(12);
        }
      });
    }
  
    document.addEventListener('DOMContentLoaded', function() {
      var editors = Array.prototype.slice.call(
        document.querySelectorAll('.gmap-zone-editor')
      );
      if (!editors.length) return;
      var apiKey = editors[0].dataset.apiKey;
      if (!apiKey) {
        console.error('GoogleDrawingWidget: missing API key');
        return;
      }
      loadScript(
        'https://maps.googleapis.com/maps/api/js?key='
         + apiKey
         + '&libraries=drawing,places',
        function() { editors.forEach(initEditor); }
      );
    });
  })();
  