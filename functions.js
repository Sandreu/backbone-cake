
function message(type, content, persist) {
  if (type=='valid') type='success';
    var elt = $('<div class="alert fade in alert-'+type+'" style="display:none;"><a class="close" href="#">&times;</a></div>'),
      close = function() { $(this).slideUp('slow'); };
    elt.append(content);
    elt.appendTo('#message_contain').slideDown('slow');
    if (!isset(persist) || !persist) setTimeout($.proxy(close, elt), 10000);
    elt.click(close);
}

function isset(variable) {
    return (typeof(variable) != 'undefined');
}

function redirect(url) {
    if (url.indexOf('#', 0)!=-1) {
        if (document.location.href==url) {
            var tabs = $('.left_tabs>ul').data('tabs');
            if (tabs) {
                var pane = $(tabs.getCurrentPane());
                var tab = $(tabs.getCurrentTab());

                pane.load(tab.attr('href'));
                visible_overlay.close();
            } else {
                refresh();
            }
        } else {
            document.location.href=url;
            if (document.location.hash) {
                refresh();
            }
        }
    } else {
        if (document.location.href==url) refresh();
        else document.location.href=url;
    }
}

function refresh() {
    document.location.reload(true);
}

function fullscreen(target) {
  var pfx = ["webkit", "moz", "ms", "o", ""];

  function RunPrefixMethod(obj, method) {
    
    var p = 0, m, t;
    while (p < pfx.length && !obj[m]) {
      m = method;
      if (pfx[p] == "") {
        m = m.substr(0,1).toLowerCase() + m.substr(1);
      }
      m = pfx[p] + m;
      t = typeof obj[m];
      if (t != "undefined") {
        pfx = [pfx[p]];
        return (t == "function" ? obj[m]() : obj[m]);
      }
      p++;
    }
    return false;
  }

  if (RunPrefixMethod(document, "FullScreen") || RunPrefixMethod(document, "IsFullScreen")) {
    RunPrefixMethod(document, "CancelFullScreen");
  }
  else {
    if (RunPrefixMethod($(target).get(0), "RequestFullScreen")===false) {
      message('error', '<center><p>Votre navigateur n\'est pas compatible avec cette fonctionnalité</p><p><a href="https://www.google.com/chrome?hl=fr" target="_blank" class="btn btn-primary">Essayez Google Chrome</a></p></center>');
    }
    $(window).trigger('resize');
  }
}