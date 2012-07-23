class WebViewController < UIViewController

  def loadView
    # Background color while loading and scrolling beyond the page boundaries
    background = UIColor.whiteColor
    self.view = UIView.alloc.initWithFrame(UIScreen.mainScreen.applicationFrame)
    self.view.backgroundColor = background
    webFrame = UIScreen.mainScreen.applicationFrame
    webFrame.origin.y = 0.0
    @webView = UIWebView.alloc.initWithFrame(webFrame)
    @webView.backgroundColor = background
    @webView.scalesPageToFit = true
    @webView.autoresizingMask = (UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight)
    @webView.delegate = self
    @webView.loadRequest(NSURLRequest.requestWithURL(NSURL.fileURLWithPath(NSBundle.mainBundle.pathForResource('index', ofType:'html'))))
  end
  
  # Remove the following if you're showing a status bar that's not translucent
  # def wantsFullScreenLayout
  #   true
  # end
  
  # Only add the web view when the page has finished loading
  def webViewDidFinishLoad(webView)
    self.view.addSubview(@webView)
    jsString = format("loadColumnChart(%s);", constructJson)
    @webView.stringByEvaluatingJavaScriptFromString(jsString)
  end
  
  # Enable rotation
  def shouldAutorotateToInterfaceOrientation(interfaceOrientation)
    # On the iPhone, don't rotate to upside-down portrait orientation
    if UIDevice.currentDevice.userInterfaceIdiom != UIUserInterfaceIdiomPad
      if interfaceOrientation == UIInterfaceOrientationPortraitUpsideDown
        return false
      end
    end
    true
  end
  
  # Open absolute links in Mobile Safari
  def webView(inWeb, shouldStartLoadWithRequest:inRequest, navigationType:inType)
    if inType == UIWebViewNavigationTypeLinkClicked && inRequest.URL.scheme != 'file' 
      UIApplication.sharedApplication.openURL(inRequest.URL)
      return false
    end
    true
  end

  def constructJson
    "{\"series\": [{\"name\": \"Brand Portfolio\",\"type\": \"column\",\"data\": [{\"y\": 22.2},{\"y\": 18},{\"y\": 18.5}]}],\"categories\": [\"Brand alpha\",\"Brand beta\",\"Brand gamma\"]}";
  end
end