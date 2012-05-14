(function (_w) {

  function iedoc() {
    var root, iedom = new ActiveXObject("htmlfile");
    iedom.appendChild(iedom.createElement('html'));
    root = iedom.getElementsByTagName('html')[0];
    root.appendChild(iedom.createElement('head'));
    root.appendChild(iedom.createElement('body'));
    iedom.open(); //doesn't seem to work without this. hackarrific
    iedom.close();  
    return iedom;
  }
  
  function i(){if(d){return}d=true;if(document.addEventListener&&!c.opera){document.addEventListener("DOMContentLoaded",g,false)}if(c.msie&&window==top)(function(){if(e)return;try{document.documentElement.doScroll("left")}catch(a){setTimeout(arguments.callee,0);return}g()})();if(c.opera){document.addEventListener("DOMContentLoaded",function(){if(e)return;for(var a=0;a<document.styleSheets.length;a++)if(document.styleSheets[a].disabled){setTimeout(arguments.callee,0);return}g()},false)}if(c.safari){var a;(function(){if(e)return;if(document.readyState!="loaded"&&document.readyState!="complete"){setTimeout(arguments.callee,0);return}if(a===undefined){var b=document.getElementsByTagName("link");for(var c=0;c<b.length;c++){if(b[c].getAttribute("rel")=="stylesheet"){a++}}var d=document.getElementsByTagName("style");a+=d.length}if(document.styleSheets.length!=a){setTimeout(arguments.callee,0);return}g()})()}h(g)}function h(a){var b=window.onload;if(typeof window.onload!="function"){window.onload=a}else{window.onload=function(){if(b){b()}a()}}}function g(){if(!e){e=true;if(f){for(var a=0;a<f.length;a++){f[a].call(window,[])}f=[]}}}var a=window.DomReady={};var b=navigator.userAgent.toLowerCase();var c={version:(b.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/)||[])[1],safari:/webkit/.test(b),opera:/opera/.test(b),msie:/msie/.test(b)&&!/opera/.test(b),mozilla:/mozilla/.test(b)&&!/(compatible|webkit)/.test(b)};var d=false;var e=false;var f=[];a.ready=function(a,b){i();if(e){a.call(window,[])}else{f.push(function(){return a.call(window,[])})}};i()
  
  function domlooper(collection, cb, done) {
    var el;
    for(i = 0; i < collection.length; i++) {
      el = collection[i];
      cb(el);
    }
    if (done) done();
  }
  
  var doc = document.implementation.createHTMLDocument ? document.implementation.createHTMLDocument('R') : iedoc(),
    escapeMethods, _d = _w.document, DOMReady, mapTag;
    
  DOMReady = _w.DomReady.ready;  

  _w['#R'] = function (implementation, opts, cb) {
    if (!(this instanceof _w['#R'])) {return new _w['#R'](implementation, opts, cb);}
    var self = this, 
    defaults = {
    escapeMethod: 'style', //specifiy escape method, 'script' or 'comment'. 
    escaper: false, //specify alternative escape code, string or regex. Will override escapeMethod if set.
    hires: true,
    hiresSuffix: '@2x', 
    breakpoints: { //
        typical: 640,
        small: 320,  
        medium: 640, //configurable properties, will be reflected in requested image e.g. name.medium.png       
        large: 1280,
        xlarge: Infinity  //largest size set to infinity
      }
    }
    

    if (typeof implementation !== 'string') { opts = implementation; implementation = null; }

    if (typeof opts === 'function') { cb = opts; opts = null; }
    
    this.cb = cb;
    this.opts = opts = opts || defaults;
    this.opts.breakpoints = opts.breakpoints || defaults.breakpoints;
    this.opts.escapeMethod = opts.escapeMethod || defaults.escapeMethod;
    

    if (!opts.escaper) {
      opts.escaper = { //s for string, r for regex
        script: '<script type="responsive/html">', //endtag </noscript></script>
        style: {s: '<style type=responsive/html>', r: /<style type=["\']?responsive\/html[\'"]?>/i}, //endtag </noscript></style>
        '<!--' : '<!--'
      }[opts.escapeMethod];
      
      mapTag = {
        script: 'ecma',
        style: 'css',
       '<!--': 'comment',     
      }[opts.escapeMethod];
      

    }
    
    DOMReady(function() {
      var _b = _d.getElementsByTagName('body')[0]
      function extract(_h) {
        doc.body.innerHTML = _h.replace(/<\/?noscript(.+)?>/g, '').replace(opts.escaper.r || opts.escaper, '')
      }
      
      
      extract(_b.innerHTML);
      
      function selectImp() {
        if (implementation) {
          if (!self[implementation]) { 
            console.error('#R: ' + implementation + ' implementation not found'); 
            self.implement(doc, true);
            return;  
          }

          self[implementation](doc, function (breakpoints) {
            self.opts.breakpoints = breakpoints || self.opts.breakpoints;
            self.implement(doc, !!breakpoints)
          });
          return;
        } 
        self.implement(doc, true);
      }

      selectImp();
        
    });



    document.write(opts.escaper.s || opts.escaper);

    
  }
  
     _w['#R'].prototype.implement = function (doc, res) {
        var cb = this.cb, opts = this.opts,
          _b = _d.getElementsByTagName('body')[0]
        function respond(scrWth) {
          var size = '', key, i;
          if (scrWth <= opts.breakpoints.typical) return;
          delete opts.breakpoints.typical;
          for (key in opts.breakpoints) {
            if (opts.breakpoints.hasOwnProperty(key)) {            
              if (scrWth <= opts.breakpoints[key]) {
                size = key + '.';           
                break;
              }
            }
          }
          
          domlooper(doc.images, function (im) {
            im.setAttribute('src', im.getAttribute('src').replace(/(.+)\.(.+)$/, '$1.' + size + '$2'));
          });
          
          return doc;
        }
        
        if (cb) { 
          cb(res ? respond(_w.screen.width) : doc);
        } else {         
          _b.innerHTML = res ? respond(_w.screen.width).body.innerHTML : doc.body.innerHTML;  
          domlooper(doc.getElementsByTagName('script'), function(scr) {
             var el = _d.createElement('script');             
             domlooper(scr.attributes, function (attr) {  
              if (attr) el.setAttribute(attr.nodeName, attr.nodeValue);
             }, function () {
              
               if (el.src) _b.appendChild(el); 
             });
             
            
             
          });
        }
        
        /*if (_w.jQuery)*/ console.log('TODO: implement faux document ready event');       
     
     }
    
  
    _w['#R'].prototype.picture = function (doc, done) {
      var pictures = (doc.getElementsByTagName('picture')), pic, attrs, sources, src, i, c,
        media, minWidth, imgSrc, img, sW = _w.screen.width,  pixelRatio, 
        pr = _w.devicePixelRatio;
                
      pr = pr || 1; //set devices pixel ratio;
      
      for(i = 0; i < pictures.length; i++) {
        pic = pictures[i];
        attrs = pic.attributes;
        sources = pic.getElementsByTagName('source');
          for(c = 0; c < sources.length; c++) {
            src = sources[c];
            media = src.getAttribute('media'); //grab the alt
           
            if (media) {
              minWidth = media.match(/min-width:([0-9]+)px/);
              minWidth = minWidth ? minWidth[1] : 0; //get min-width media query for each source element
              
              pixelRatio = media.match(/min-device-pixel-ratio:([0-9]+)/); //get min-device-pixel-ratio
              pixelRatio = pixelRatio ? pixelRatio[1] : 1; 
                            
              if (minWidth < sW && pr === pixelRatio) { imgSrc = src; } //set imgSrc to the source element if conditions match
            }
          }
        img = doc.createElement('img'); //create a new image element on the ghost DOM

        img.setAttribute('src', imgSrc.getAttribute('src'));
                
        for(c = 0; c < attrs.length; c++) {
        img.setAttribute(attrs[c].nodeName, attrs[c].nodeValue);        
        }

        
        pic.parentNode.replaceChild(img, pic); //replace picture element with create img element
      }
      
      
      done(); //finished.
    }




  
}(window));
