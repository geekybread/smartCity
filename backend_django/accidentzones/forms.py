# yourapp/forms.py

from django import forms
from django.utils.safestring import mark_safe
from django.conf import settings
import json

class GoogleDrawingWidget(forms.Widget):
    class Media:
        css = {'all': ('accidentzones/css/google_drawing_widget.css',)}
        js  = ('accidentzones/js/google_drawing_widget.js',)

    def render(self, name, value, attrs=None, renderer=None):
        api_key = settings.GOOGLE_MAPS_API_KEY
        coords  = json.dumps(value or [])
        html = (
            f"<div class='gmap-container'>"
              f"<input id='search_{name}' class='gmap-search-box' "
                     f"type='text' placeholder='Search city...'/>"
              f"<div id='gmap_{name}' class='gmap-zone-editor' "
                     f"data-api-key='{api_key}'></div>"
            f"</div>"
            f"<textarea id='id_{name}' name='{name}' hidden>"
              f"{coords}"
            f"</textarea>"
        )
        return mark_safe(html)
