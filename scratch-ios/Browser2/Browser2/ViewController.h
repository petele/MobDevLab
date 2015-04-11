//
//  ViewController.h
//  Browser2
//
//  Created by Pete LePage on 2/27/15.
//  Copyright (c) 2015 PeteLe. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <Firebase/Firebase.h>

@interface ViewController : UIViewController

@property (nonatomic, strong) Firebase* myRootRef;

- (void)initFirebase;
- (void)connectFirebase;
- (void)disconnectFirebase;

@end

