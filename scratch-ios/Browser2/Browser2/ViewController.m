//
//  ViewController.m
//  Browser2
//
//  Created by Pete LePage on 2/27/15.
//  Copyright (c) 2015 PeteLe. All rights reserved.
//

#import "ViewController.h"
#import <Firebase/Firebase.h>

static const CGFloat kLabelHeight = 14.0f;
static const CGFloat kMargin = 10.0f;
static const CGFloat kSpacer = 2.0f;
static const CGFloat kLabelFontSize = 10.0f;
static const CGFloat kAddressFontSize = 14.0f;
static const CGFloat kAddressHeight = 22.0f;

@interface ViewController () <UIWebViewDelegate>
@property (strong, nonatomic) IBOutlet UIWebView *webView;
@property (strong, nonatomic) IBOutlet UIBarButtonItem *butBack;
@property (strong, nonatomic) IBOutlet UIBarButtonItem *butStop;
@property (strong, nonatomic) IBOutlet UIBarButtonItem *butRefresh;
@property (strong, nonatomic) IBOutlet UIBarButtonItem *butForward;

@property (strong, nonatomic) UILabel *pageTitle;
@property (strong, nonatomic) UITextField *addressField;

@property (strong, nonatomic) NSString *strURL;

- (void)loadRequestFromString:(NSString*)urlString;
- (void)loadRequestFromAddressField:(id)addressField;

- (void)updateTitle:(UIWebView*)aWebView;
- (void)updateAddress:(NSURLRequest*)request;
- (void)updateButtons;

- (void)informError:(NSError*)error;

- (void)initFirebase;
- (void)connectFirebase;
- (void)disconnectFirebase;

@end

@implementation ViewController

- (void)initFirebase {
    NSLog(@"initFirebase");
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSString *fbAppName = [defaults stringForKey:@"fbAppName"];
    if (!fbAppName) {
        fbAppName = [NSString stringWithFormat:@"shining-inferno-4243"];
    }

    NSString *fbURL = [NSString stringWithFormat:@"https://%@.firebaseio.com/url", fbAppName];

    self.myRootRef = [[Firebase alloc] initWithUrl:fbURL];
}

- (void)connectFirebase {
    NSLog(@"connectFirebase");
    [[[self.myRootRef queryOrderedByKey] queryLimitedToLast:1 ]
     observeEventType:FEventTypeChildAdded withBlock:^(FDataSnapshot *snapshot) {
         @try {
             NSLog(@"%@ -> %@", snapshot.key, snapshot.value[@"url"]);
             self.strURL = snapshot.value[@"url"];
             [self loadRequestFromString:self.strURL];
         }
         @catch (NSException *ex) {
             NSLog(@"%@", ex.reason);
         }
     }];
}

- (void)disconnectFirebase {
    NSLog(@"disconnectFirebase");
    [self.myRootRef removeAllObservers];
    
}

- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
    [self updateAddress:request];
    return YES;
}

- (void)webViewDidStartLoad:(UIWebView *)webView {
    [UIApplication sharedApplication].networkActivityIndicatorVisible = YES;
    [self updateButtons];
}

- (void)webViewDidFinishLoad:(UIWebView *)webView {
    [UIApplication sharedApplication].networkActivityIndicatorVisible = NO;
    [[NSUserDefaults standardUserDefaults] setInteger:0 forKey:@"WebKitCacheModelPreferenceKey"];
    [self updateButtons];
    [self updateTitle:webView];
    [self updateAddress:[webView request]];
}

- (void)webView:(UIWebView *)webView didFailLoadWithError:(NSError *)error {
    [UIApplication sharedApplication].networkActivityIndicatorVisible = NO;
    NSLog(@"didFailLoadWithError: %@", error.description);
    [self.webView stopLoading];
    [[NSURLCache sharedURLCache] removeAllCachedResponses];
    [self updateButtons];
    [self informError:error];
}

- (void)viewDidLoad {
    [super viewDidLoad];
    NSLog(@"viewDidLoad");
    
    NSMutableString *readyBody = [[NSMutableString alloc]init];
    [readyBody appendString:@"<html><head>"];
    [readyBody appendString:@"<meta name='viewport' content='width=device-width,initial-scale=1'>"];
    [readyBody appendString:@"<style>body { font-family: Roboto, Helvetica; text-align: center; } "];
    [readyBody appendString:@"h1 { font-size: 55vw; } "];
    [readyBody appendString:@"</style><head><body><div>"];
    [readyBody appendString:@"<h1>:)</h1>"];
    [readyBody appendString:@"</div></body></html>"];
    [self.webView loadHTMLString:readyBody baseURL:nil];
    
    /* Create the page title label */
    UINavigationBar *navBar = self.navigationController.navigationBar;
    CGRect labelFrame = CGRectMake(kMargin, kSpacer, navBar.bounds.size.width - 2*kMargin, kLabelHeight);
    UILabel *label = [[UILabel alloc] initWithFrame:labelFrame];
    label.autoresizingMask = UIViewAutoresizingFlexibleWidth;
    label.backgroundColor = [UIColor clearColor];
    label.font = [UIFont systemFontOfSize:kLabelFontSize];
    label.textAlignment = NSTextAlignmentCenter;
    [navBar addSubview:label];
    self.pageTitle = label;

    /* Create the address bar */
    CGRect addressFrame = CGRectMake(kMargin, kSpacer*2.0 + kLabelHeight, labelFrame.size.width, kAddressHeight);
    UITextField *address = [[UITextField alloc] initWithFrame:addressFrame];
    address.autoresizingMask = UIViewAutoresizingFlexibleWidth;
    address.borderStyle = UITextBorderStyleRoundedRect;
    address.font = [UIFont systemFontOfSize:kAddressFontSize];
    address.keyboardType = UIKeyboardTypeURL;
    address.autocapitalizationType = UITextAutocapitalizationTypeNone;
    address.clearButtonMode = UITextFieldViewModeWhileEditing;
    [address addTarget:self action:@selector(loadRequestFromAddressField:)
      forControlEvents:UIControlEventEditingDidEndOnExit];
    [navBar addSubview:address];
    self.addressField = address;
    self.webView.delegate = self;
    
    @try {
        [self initFirebase];
    }
    @catch (NSException *ex) {
        NSLog(@"Firebase failed: %@", ex.reason);
    }

    
    UIApplication *thisApp = [UIApplication sharedApplication];
    thisApp.idleTimerDisabled = YES;
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
    NSLog(@"didReceiveMemoryWarning");
    [[NSURLCache sharedURLCache] removeAllCachedResponses];
}

- (void)loadRequestFromString:(NSString*)urlString {
    NSURL *url = [NSURL URLWithString:urlString];
    if (!url.scheme) {
        NSString *modifiedURL = [NSString stringWithFormat:@"http://%@", urlString];
        url = [NSURL URLWithString:modifiedURL];
    }
    NSURLRequest *urlRequest = [NSURLRequest requestWithURL:url];
    if (self.webView.isLoading) {
        [self.webView stopLoading];
    }
    [self.webView loadRequest:urlRequest];
    
}

- (void)loadRequestFromAddressField:(id)addressField {
    NSString *urlString = [addressField text];
    [self loadRequestFromString:urlString];
}

- (void)updateTitle:(UIWebView*)aWebView {
    NSString* pageTitle = [aWebView stringByEvaluatingJavaScriptFromString:@"document.title"];
    self.pageTitle.text = pageTitle;
}

- (void)updateAddress:(NSURLRequest*)request {
    NSURL *url = [request mainDocumentURL];
    NSString *absoluteString = [url absoluteString];
    self.addressField.text = absoluteString;
}

- (void)informError:(NSError *)error {
    NSLog(@"informError: %@", error.description);
    NSMutableString *readyBody = [[NSMutableString alloc]init];
    [readyBody appendString:@"<html><head>"];
    [readyBody appendString:@"<meta name='viewport' content='width=device-width,initial-scale=1'>"];
    [readyBody appendString:@"<style>body { font-family: Roboto, Helvetica; text-align: center; } "];
    [readyBody appendString:@"h1 { font-size: 55vw; } "];
    [readyBody appendString:@"</style><head><body><div>"];
    [readyBody appendString:@"<h1>:(</h1>"];
    [readyBody appendFormat:@"<code>%@</code>", error.localizedDescription];
    [readyBody appendFormat:@"<p><a href='%@'>%@</a></p>", self.strURL, self.strURL];
    [readyBody appendString:@"</div></body></html>"];
    [self.webView loadHTMLString:readyBody baseURL:nil];
}

- (void)updateButtons {
    self.butForward.enabled = self.webView.canGoForward;
    self.butBack.enabled = self.webView.canGoBack;
    self.butStop.enabled = self.webView.loading;
}

@end
