CREATE TABLE `SITE_USER` (
  `user_id` int PRIMARY KEY AUTO_INCREMENT,
  `email_address` varchar(255) UNIQUE NOT NULL,
  `phone_nb` int(8) UNIQUE NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(20) NOT NULL,
  `last_name` varchar(20) NOT NULL,
  `username` varchar(20) NOT NULL,
  `balance` decimal(8,2) NOT NULL DEFAULT 0 COMMENT 'Derived from credit_update and order_item',
  `display_picture` varchar(255) COMMENT 'Path to corresponding image',
  `is_Moderator` boolean NOT NULL DEFAULT FALSE,
  `date_of_birth` date NOT NULL,
  `gender` char(1) NOT NULL DEFAULT "o" COMMENT 'Taken for analytics purposes',
  `date_created` datetime NOT NULL DEFAULT now(),
  `date_updated` datetime DEFAULT null,site_user
  `date_deleted` datetime DEFAULT null
);

CREATE TABLE `ADDRESS` (
  `address_id` int PRIMARY KEY AUTO_INCREMENT,
  `region` varchar(20) NOT NULL,
  `city` varchar(20) NOT NULL,
  `street` varchar(20) NOT NULL,
  `building` varchar(20) NOT NULL,
  `floor` int(2) NOT NULL DEFAULT 0,
  `apartment` int(4) NOT NULL DEFAULT 0,
  `description` varchar(255),
  `phone_nb` int(8),
  `date_created` datetime NOT NULL DEFAULT "now()",
  `date_updated` datetime DEFAULT null,
  `date_deleted` datetime DEFAULT null
);

CREATE TABLE `USER_ADDRESS` (
  `user_id` int,
  `address_id` int,
  `is_default` boolean NOT NULL DEFAULT "True",
  `date_created` datetime NOT NULL DEFAULT "now()",
  `date_updated` datetime DEFAULT null,
  `date_deleted` datetime DEFAULT null,
  PRIMARY KEY (`user_id`, `address_id`)
);

CREATE TABLE `USER_REVIEW` (
  `review_id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int,
  `ordered_product_id` int,
  `rating_value` int(5) NOT NULL,
  `comment` varchar(255),
  `date_created` datetime NOT NULL DEFAULT "now()",
  `date_updated` datetime DEFAULT null,
  `date_deleted` datetime DEFAULT null
);

CREATE TABLE `USER_PAYMENT_METHOD` (
  `user_payment_method_id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int,
  `payment_type` varchar(10) NOT NULL,
  `provider` varchar(255) NOT NULL,
  `account_number` int NOT NULL,
  `expiry_date` date NOT NULL,
  `is_default` boolean NOT NULL DEFAULT "True",
  `date_created` datetime NOT NULL DEFAULT "now()",
  `date_updated` datetime DEFAULT null,
  `date_deleted` datetime DEFAULT null
);

CREATE TABLE `SHOPPING_CART` (
  `shopping_cart_id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int,
  `date_created` datetime DEFAULT "now()",
  `date_updated` datetime DEFAULT null,
  `date_deleted` datetime DEFAULT null
);

CREATE TABLE `SHOPPING_CART_ITEM` (
  `shopping_cart_item_id` int PRIMARY KEY AUTO_INCREMENT,
  `cart_id` int,
  `product_item_id` int,
  `qty` int NOT NULL DEFAULT 1,
  `date_created` datetime NOT NULL DEFAULT "now()",
  `date_updated` datetime DEFAULT null,
  `date_deleted` datetime DEFAULT null
);

CREATE TABLE `ORDER_ITEM` (
  `order_item_id` int PRIMARY KEY AUTO_INCREMENT,
  `product_item_id` int,
  `order_id` int,
  `qty` int NOT NULL DEFAULT 1,
  `price` decimal(8,2),
  `sender_id` int,
  `receiver_id` int,
  `date_created` datetime NOT NULL DEFAULT "now()",
  `date_updated` datetime DEFAULT null,
  `date_deleted` datetime DEFAULT null
);

CREATE TABLE `SHOP_ORDER` (
  `shop_order_id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int,
  `shipping_address` int,
  `order_total` decimal(8,2),
  `date_created` datetime NOT NULL DEFAULT "now()",
  `date_updated` datetime DEFAULT null,
  `date_deleted` datetime DEFAULT null
);

CREATE TABLE `PRODUCT_ITEM` (
  `product_item_id` int PRIMARY KEY AUTO_INCREMENT,
  `product_id` int,
  `SKU` int(10) UNIQUE AUTO_INCREMENT,
  `qty_in_stock` int NOT NULL,
  `price` decimal(8,2) NOT NULL,
  `date_created` datetime NOT NULL DEFAULT "now()",
  `date_updated` datetime DEFAULT null,
  `date_deleted` datetime DEFAULT null
);

CREATE TABLE `PRODUCT` (
  `product_id` int PRIMARY KEY AUTO_INCREMENT,
  `category_id` int,
  `name` varchar(255) NOT NULL,
  `description` varchar(255),
  `seller_id` int,
  `date_created` datetime NOT NULL DEFAULT "now()",
  `date_updated` datetime DEFAULT null,
  `date_deleted` datetime DEFAULT null
);

CREATE TABLE `PRODUCT_CATEGORY` (
  `product_category_id` int PRIMARY KEY AUTO_INCREMENT,
  `parent_category_id` int,
  `category_name` varchar(255) UNIQUE NOT NULL,
  `date_created` datetime NOT NULL DEFAULT "now()",
  `date_updated` datetime DEFAULT null,
  `date_deleted` datetime DEFAULT null
);

CREATE TABLE `PROMOTION` (
  `promotion_id` int PRIMARY KEY AUTO_INCREMENT,
  `product_id` int,
  `name` varchar(255),
  `description` varchar(255),
  `discount_rate` float8,
  `start_date` datetime,
  `end_date` datetime,
  `date_created` datetime NOT NULL DEFAULT "now()",
  `date_updated` datetime DEFAULT null,
  `date_deleted` datetime DEFAULT null
);

CREATE TABLE `PRODUCT_GALLERY` (
  `product_gallery_id` int PRIMARY KEY AUTO_INCREMENT,
  `product_id` int,
  `image_path` varchar(255),
  `date_created` datetime NOT NULL DEFAULT "now()",
  `date_updated` datetime DEFAULT null,
  `date_deleted` datetime DEFAULT null
);

CREATE TABLE `MAIL` (
  `mail_id` int PRIMARY KEY AUTO_INCREMENT,
  `sender_id` int,
  `receiver_id` int,
  `message` varchar(255) COMMENT 'Path to the txt file in directory',
  `date_created` datetime NOT NULL DEFAULT "now()",
  `date_updated` datetime DEFAULT null,
  `date_deleted` datetime DEFAULT null
);

CREATE TABLE `CREDIT_UPDATE` (
  `credit_update_id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int,
  `payment_method_id` int,
  `amount` decimal(8,2),
  `deposit` boolean,
  `date_created` datetime NOT NULL DEFAULT "now()",
  `date_updated` datetime DEFAULT null,
  `date_deleted` datetime DEFAULT null
);

ALTER TABLE `USER_ADDRESS` ADD FOREIGN KEY (`user_id`) REFERENCES `SITE_USER` (`user_id`);

ALTER TABLE `USER_ADDRESS` ADD FOREIGN KEY (`address_id`) REFERENCES `ADDRESS` (`address_id`);

ALTER TABLE `USER_REVIEW` ADD FOREIGN KEY (`user_id`) REFERENCES `SITE_USER` (`user_id`);

ALTER TABLE `USER_REVIEW` ADD FOREIGN KEY (`ordered_product_id`) REFERENCES `ORDER_ITEM` (`order_item_id`);

ALTER TABLE `USER_PAYMENT_METHOD` ADD FOREIGN KEY (`user_id`) REFERENCES `SITE_USER` (`user_id`);

ALTER TABLE `SHOPPING_CART` ADD FOREIGN KEY (`user_id`) REFERENCES `SITE_USER` (`user_id`);

ALTER TABLE `SHOPPING_CART_ITEM` ADD FOREIGN KEY (`cart_id`) REFERENCES `SHOPPING_CART` (`shopping_cart_id`);

ALTER TABLE `SHOPPING_CART_ITEM` ADD FOREIGN KEY (`product_item_id`) REFERENCES `PRODUCT_ITEM` (`product_item_id`);

ALTER TABLE `ORDER_ITEM` ADD FOREIGN KEY (`product_item_id`) REFERENCES `PRODUCT_ITEM` (`product_item_id`);

ALTER TABLE `ORDER_ITEM` ADD FOREIGN KEY (`order_id`) REFERENCES `SHOP_ORDER` (`shop_order_id`);

ALTER TABLE `ORDER_ITEM` ADD FOREIGN KEY (`sender_id`) REFERENCES `SITE_USER` (`user_id`);

ALTER TABLE `ORDER_ITEM` ADD FOREIGN KEY (`receiver_id`) REFERENCES `SITE_USER` (`user_id`);

ALTER TABLE `SHOP_ORDER` ADD FOREIGN KEY (`user_id`) REFERENCES `SITE_USER` (`user_id`);

ALTER TABLE `SHOP_ORDER` ADD FOREIGN KEY (`shipping_address`) REFERENCES `ADDRESS` (`address_id`);

ALTER TABLE `PRODUCT_ITEM` ADD FOREIGN KEY (`product_id`) REFERENCES `PRODUCT` (`product_id`);

ALTER TABLE `PRODUCT` ADD FOREIGN KEY (`category_id`) REFERENCES `PRODUCT_CATEGORY` (`product_category_id`);

ALTER TABLE `PRODUCT` ADD FOREIGN KEY (`seller_id`) REFERENCES `SITE_USER` (`user_id`);

ALTER TABLE `PRODUCT_CATEGORY` ADD FOREIGN KEY (`product_category_id`) REFERENCES `PRODUCT_CATEGORY` (`parent_category_id`);

ALTER TABLE `PROMOTION` ADD FOREIGN KEY (`product_id`) REFERENCES `PRODUCT` (`product_id`);

ALTER TABLE `PRODUCT_GALLERY` ADD FOREIGN KEY (`product_id`) REFERENCES `PRODUCT_ITEM` (`product_item_id`);

ALTER TABLE `MAIL` ADD FOREIGN KEY (`sender_id`) REFERENCES `SITE_USER` (`user_id`);

ALTER TABLE `MAIL` ADD FOREIGN KEY (`receiver_id`) REFERENCES `SITE_USER` (`user_id`);

ALTER TABLE `CREDIT_UPDATE` ADD FOREIGN KEY (`user_id`) REFERENCES `SITE_USER` (`user_id`);

ALTER TABLE `CREDIT_UPDATE` ADD FOREIGN KEY (`payment_method_id`) REFERENCES `USER_PAYMENT_METHOD` (`user_payment_method_id`);
