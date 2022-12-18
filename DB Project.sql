CREATE DATABASE MARKIT;
USE MARKIT;
CREATE TABLE `SITE_USER` (
  `userId` int PRIMARY KEY AUTO_INCREMENT,
  `username` varchar(20) UNIQUE NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) UNIQUE NOT NULL,
  `isModerator` boolean NOT NULL DEFAULT 0,
  `phoneNumber` int(8) UNIQUE NOT NULL,
  `firstName` varchar(20) NOT NULL,
  `lastName` varchar(20) NOT NULL,
  `balance` decimal(8,2) NOT NULL DEFAULT 0 COMMENT 'Derived from credit_update and order_item',
  `displayPicture` varchar(255) COMMENT 'Path to corresponding image',
  `dateOfBirth` date NOT NULL,
  `gender` char(1) NOT NULL DEFAULT "o" COMMENT 'Taken for analytics purposes',
  `dateCreated` datetime NOT NULL DEFAULT NOW(),
  `dateUpdated` datetime DEFAULT null,
  `dateDeleted` datetime DEFAULT null
);

CREATE TABLE `ADDRESS` (
  `addressId` int PRIMARY KEY AUTO_INCREMENT,
  `userId` int,
  `phoneNumber` int(8),
  `region` varchar(20) NOT NULL,
  `city` varchar(20) NOT NULL,
  `street` varchar(20) NOT NULL,
  `building` varchar(20) NOT NULL,
  `floor` int(2) NOT NULL DEFAULT 0,
  `apartment` int(4) NOT NULL DEFAULT 0,
  `description` varchar(255),
  `dateCreated` datetime NOT NULL DEFAULT NOW(),
  `dateUpdated` datetime DEFAULT null,
  `dateDeleted` datetime DEFAULT null
);

CREATE TABLE `USER_REVIEW` (
  `reviewId` int PRIMARY KEY AUTO_INCREMENT,
  `userId` int,
  `orderedItemId` int,
  `ratingValue` tinyint(5) NOT NULL,
  `comment` varchar(255),
  `dateCreated` datetime NOT NULL DEFAULT NOW(),
  `dateUpdated` datetime DEFAULT null,
  `dateDeleted` datetime DEFAULT null
);

CREATE TABLE `USER_PAYMENT_METHOD` (
  `userPaymentMethodId` int PRIMARY KEY AUTO_INCREMENT,
  `userId` int,
  `cardName` varchar(15) NOT NULL, -- e.g. mastercard or visa or whatever
  `firstName` varchar(20) NOT NULL,
  `lastName` varchar(20) NOT NULL,
  `cardNumber` decimal(16) NOT NULL,
  `expirationDate` date NOT NULL, -- input is MMYY but stored as last day of that year
  `CVV` decimal(3) NOT NULL, 
  `dateCreated` datetime NOT NULL DEFAULT NOW(),
  `dateUpdated` datetime DEFAULT null,
  `dateDeleted` datetime DEFAULT null
);

CREATE TABLE `SHOPPING_CART` (
  `shoppingCartId` int PRIMARY KEY AUTO_INCREMENT,
  `userId` int,
  `dateCreated` datetime DEFAULT NOW(),
  `dateDeleted` datetime DEFAULT null
);

CREATE TABLE `SHOPPING_CART_ITEM` (
  `shoppingCartItemId` int PRIMARY KEY AUTO_INCREMENT,
  `shoppingCartId` int,
  `productItemId` int,
  `qty` int NOT NULL DEFAULT 1,
  `dateCreated` datetime NOT NULL DEFAULT NOW(),
  `dateUpdated` datetime DEFAULT null,
  `dateDeleted` datetime DEFAULT null
);

CREATE TABLE `ORDER_ITEM` (
  `orderItemId` int PRIMARY KEY AUTO_INCREMENT,
  `productItemId` int,
  `shopOrderId` int,
  `qty` int NOT NULL DEFAULT 1,
  `totalPrice` decimal(8,2),
  `senderId` int,
  `receiverId` int,
  `dateCreated` datetime NOT NULL DEFAULT NOW(),
  `dateDeleted` datetime DEFAULT null
);

CREATE TABLE `SHOP_ORDER` (
  `shopOrderId` int PRIMARY KEY AUTO_INCREMENT,
  `userId` int,
  `shippingAddress` int,
  `dateCreated` datetime NOT NULL DEFAULT NOW(),
  `dateDeleted` datetime DEFAULT null
);

CREATE TABLE `PRODUCT_ITEM` (
  `productItemId` int PRIMARY KEY AUTO_INCREMENT,
  `productId` int,
  `qtyInStock` int NOT NULL,
  `price` decimal(8,2) NOT NULL,
  `dateCreated` datetime NOT NULL DEFAULT NOW(),
  `dateUpdated` datetime DEFAULT null,
  `dateDeleted` datetime DEFAULT null
);

CREATE TABLE `PRODUCT` (
  `productId` int PRIMARY KEY AUTO_INCREMENT,
  `sellerId` int,
  `categoryId` int,
  `name` varchar(255) NOT NULL,
  `description` varchar(255),
  `dateCreated` datetime NOT NULL DEFAULT NOW(),
  `dateUpdated` datetime DEFAULT null,
  `dateDeleted` datetime DEFAULT null
);

CREATE TABLE `PRODUCT_CATEGORY` (
  `productCategoryId` int PRIMARY KEY AUTO_INCREMENT,
  `parentCategoryId` int DEFAULT NULL,
  `categoryName` varchar(255) UNIQUE NOT NULL,
  `dateCreated` datetime NOT NULL DEFAULT NOW(),
  `dateUpdated` datetime DEFAULT null,
  `dateDeleted` datetime DEFAULT null
);

CREATE TABLE `PRODUCT_GALLERY` (
  `productGalleryId` int PRIMARY KEY AUTO_INCREMENT,
  `productId` int,
  `imagePath` varchar(255),
  `dateCreated` datetime NOT NULL DEFAULT NOW(),
  `dateUpdated` datetime DEFAULT null,
  `dateDeleted` datetime DEFAULT null
);

CREATE TABLE `MAIL` (
  `mailId` int PRIMARY KEY AUTO_INCREMENT,
  `senderId` int NOT NULL,
  `receiverId` int NOT NULL,
  `subject` varchar(50) NOT NULL DEFAULT "NO SUBJECT",
  `message` varchar(255) COMMENT 'Path to the txt file in directory',
  `dateCreated` datetime NOT NULL DEFAULT NOW(),
  `dateDeleted` datetime DEFAULT null
);

CREATE TABLE `CREDIT_UPDATE` (
  `creditUpdateId` int PRIMARY KEY AUTO_INCREMENT,
  `userId` int,
  `paymentMethodId` int,
  `amount` decimal(8,2),
  `deposit` boolean,
  `dateCreated` datetime NOT NULL DEFAULT NOW(),
  `dateDeleted` datetime DEFAULT null
);

ALTER TABLE `ADDRESS` ADD FOREIGN KEY (`userId`) REFERENCES `SITE_USER` (`userId`);

ALTER TABLE `USER_REVIEW` ADD FOREIGN KEY (`userId`) REFERENCES `SITE_USER` (`userId`);

ALTER TABLE `USER_REVIEW` ADD FOREIGN KEY (`orderedItemId`) REFERENCES `ORDER_ITEM` (`orderItemId`);

ALTER TABLE `USER_PAYMENT_METHOD` ADD FOREIGN KEY (`userId`) REFERENCES `SITE_USER` (`userId`);

ALTER TABLE `SHOPPING_CART` ADD FOREIGN KEY (`userId`) REFERENCES `SITE_USER` (`userId`);

ALTER TABLE `SHOPPING_CART_ITEM` ADD FOREIGN KEY (`shoppingCartId`) REFERENCES `SHOPPING_CART` (`shoppingCartId`);

ALTER TABLE `SHOPPING_CART_ITEM` ADD FOREIGN KEY (`productItemId`) REFERENCES `PRODUCT_ITEM` (`productItemId`);

ALTER TABLE `ORDER_ITEM` ADD FOREIGN KEY (`productItemId`) REFERENCES `PRODUCT_ITEM` (`productItemId`);

ALTER TABLE `ORDER_ITEM` ADD FOREIGN KEY (`shopOrderId`) REFERENCES `SHOP_ORDER` (`shopOrderId`);

ALTER TABLE `ORDER_ITEM` ADD FOREIGN KEY (`senderId`) REFERENCES `SITE_USER` (`userId`);

ALTER TABLE `ORDER_ITEM` ADD FOREIGN KEY (`receiverId`) REFERENCES `SITE_USER` (`userId`);

ALTER TABLE `SHOP_ORDER` ADD FOREIGN KEY (`userId`) REFERENCES `SITE_USER` (`userId`);

ALTER TABLE `SHOP_ORDER` ADD FOREIGN KEY (`shippingAddress`) REFERENCES `ADDRESS` (`addressId`);

ALTER TABLE `PRODUCT_ITEM` ADD FOREIGN KEY (`productId`) REFERENCES `PRODUCT` (`productId`);

ALTER TABLE `PRODUCT` ADD FOREIGN KEY (`sellerId`) REFERENCES `SITE_USER` (`userId`);

ALTER TABLE `PRODUCT` ADD FOREIGN KEY (`categoryId`) REFERENCES `PRODUCT_CATEGORY` (`productCategoryId`);

ALTER TABLE `PRODUCT_CATEGORY` ADD FOREIGN KEY (`parentCategoryId`) REFERENCES `PRODUCT_CATEGORY` (`productCategoryId`);

ALTER TABLE `PRODUCT_GALLERY` ADD FOREIGN KEY (`productId`) REFERENCES `PRODUCT_ITEM` (`productItemId`);

ALTER TABLE `MAIL` ADD FOREIGN KEY (`senderId`) REFERENCES `SITE_USER` (`userId`);

ALTER TABLE `MAIL` ADD FOREIGN KEY (`receiverId`) REFERENCES `SITE_USER` (`userId`);

ALTER TABLE `CREDIT_UPDATE` ADD FOREIGN KEY (`userId`) REFERENCES `SITE_USER` (`userId`);

ALTER TABLE `CREDIT_UPDATE` ADD FOREIGN KEY (`paymentMethodId`) REFERENCES `USER_PAYMENT_METHOD` (`userPaymentMethodId`);
