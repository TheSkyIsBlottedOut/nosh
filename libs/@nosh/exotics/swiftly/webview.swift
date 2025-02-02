import WebKit

public class WebView: WKWebView {    
    public init() {
        super.init(frame: CGRect(x: 0, y: 0, width: 400, height: 400), configuration: WebViewConfiguration())
        let navigationDelegate = WebViewHandler()
        self.navigationDelegate = navigationDelegate
        self.translatesAutoresizingMaskIntoConstraints = false
        self.setScrollViewDefaultBehavior()
    }
    
    public func setScrollViewDefaultBehavior() {
        self.scrollView.isScrollEnabled = true
        self.scrollView.bounces = true
        self.scrollView.showsVerticalScrollIndicator = true
        self.scrollView.showsHorizontalScrollIndicator = true
        self.scrollView.alwaysBounceVertical = true
        self.scrollView.alwaysBounceHorizontal = true
        self.scrollView.bouncesZoom = true
        self.scrollView.contentInsetAdjustmentBehavior = .automatic
    }
    
    public func loadURL(_ url: String) {
        self.load(URLRequest(url: URL(string: url)!))
    }
    
    public required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    public override init(frame: CGRect, configuration: WKWebViewConfiguration) {
        super.init(frame: frame, configuration: configuration)
    }
    
    public func loadHTMLString(_ string: String) {
        self.loadHTMLString(string, baseURL: nil as URL?)
    }    
}

public class WebViewHandler: NSObject, WKNavigationDelegate {
    public func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        print("didStartProvisionalNavigation")
    }
    
    public func webView(_ webView: WKWebView, didCommit navigation: WKNavigation!) {
        print("didCommit")
    }
    
    public func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        print("didFinish")
    }
    
    public func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        print("didFail \(error)")
    }
    
    public func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        print("didFailProvisionalNavigation \(error)")
    }
}

public class WebViewConfiguration: WKWebViewConfiguration {
    public override init() {
        super.init()
        self.preferences.javaScriptCanOpenWindowsAutomatically = true
    }
    
    public required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}


public class WebViewApplication {
    var webview: WebView!
    public static func main() {
        let app = WebViewApplication()
        app.webview = WebView()
        app.construct(app.initialHTML())
    }
    
    public func layoutWrapper(_ contents: String) -> String {
        return "<html><body><div id='main'>\(contents)</div></body></html>"
    }
    public func initialHTML() -> String {
        return self.layoutWrapper("Hello World")
    }
    public func construct(_ contents: String) {
        self.webview.loadHTMLString(contents)
    }
}

public class Application: WebViewApplication {
    public override func initialHTML() -> String {
        return self.layoutWrapper("Hello Overridden World")
    }   
}

func main() {
    WebViewApplication.main()
}