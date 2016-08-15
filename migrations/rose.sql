-- MySQL dump 10.13  Distrib 5.5.44, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: rose
-- ------------------------------------------------------
-- Server version	5.5.44-0ubuntu0.14.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `AffiliateConfigs`
--

DROP TABLE IF EXISTS `AffiliateConfigs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `AffiliateConfigs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `level` int(11) DEFAULT NULL,
  `percent` int(11) NOT NULL DEFAULT '0',
  `trafficPlanId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `affiliate_configs_level` (`level`),
  KEY `affiliate_configs_traffic_plan_id` (`trafficPlanId`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Apks`
--

DROP TABLE IF EXISTS `Apks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Apks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `downloadTime` int(11) NOT NULL DEFAULT '0',
  `version` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `sellerId` int(11) DEFAULT NULL,
  `reward` int(11) NOT NULL DEFAULT '0',
  `sortNum` int(11) NOT NULL DEFAULT '0',
  `apk` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `apkPath` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `apkSize` int(11) DEFAULT '0',
  `icon` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `image01` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `image02` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `image03` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8_unicode_ci,
  `digest` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `adimage` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `apks_is_active` (`isActive`),
  KEY `apks_seller_id` (`sellerId`),
  KEY `apks_sort_num` (`sortNum`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Banners`
--
DROP TABLE IF EXISTS `Banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Banners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `image` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `active` tinyint(1) DEFAULT NULL,
  `sortNum` int(11) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `url` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `banners_active` (`active`),
  KEY `banners_sort_num` (`sortNum`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Coupons`
--

DROP TABLE IF EXISTS `Coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Coupons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `trafficPlanId` int(11) DEFAULT NULL,
  `discount` float DEFAULT '0',
  `extend` int(11) DEFAULT '0',
  `ignoreLevel` tinyint(1) DEFAULT '1',
  `expiredAt` datetime DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `coupons_traffic_plan_id` (`trafficPlanId`),
  KEY `coupons_is_active` (`isActive`),
  KEY `coupons_expired_at` (`expiredAt`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Customers`
--

DROP TABLE IF EXISTS `Customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Customers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `wechat` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `salt` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `lastLoginAt` datetime DEFAULT NULL,
  `remainingTraffic` decimal(10,2) DEFAULT '0.00',
  `expenditure` int(11) DEFAULT '0',
  `income` int(11) DEFAULT '0',
  `sex` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `city` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `province` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `country` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `headimgurl` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `levelId` int(11) DEFAULT NULL,
  `isSubscribe` tinyint(1) NOT NULL DEFAULT '0',
  `salary` decimal(10,2) NOT NULL,
  `subscribeTime` datetime DEFAULT NULL,
  `ticket` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ancestry` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ancestryDepth` int(11) NOT NULL DEFAULT '0',
  `orderTotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `isAffiliate` tinyint(1) NOT NULL DEFAULT '0',
  `allowGiven` tinyint(1) NOT NULL DEFAULT '1',
  `bindPhone` tinyint(1) NOT NULL DEFAULT '0',
  `myticket` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `totalIntegral` int(11) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `wechatIndex` (`wechat`),
  UNIQUE KEY `phoneIndex` (`phone`),
  KEY `customers_wechat` (`wechat`),
  KEY `customers_phone` (`phone`),
  KEY `customers_level_id` (`levelId`),
  KEY `customers_ancestry_depth` (`ancestryDepth`),
  KEY `customers_ancestry` (`ancestry`)
) ENGINE=InnoDB AUTO_INCREMENT=11040 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `DConfigs`
--

DROP TABLE IF EXISTS `DConfigs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DConfigs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `value` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `d_configs_name` (`name`),
  KEY `d_configs_value` (`value`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `DataPlans`
--

DROP TABLE IF EXISTS `DataPlans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DataPlans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `value` decimal(10,2) DEFAULT '0.00',
  `price` decimal(10,2) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ExtractOrders`
--

DROP TABLE IF EXISTS `ExtractOrders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ExtractOrders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `state` int(11) NOT NULL DEFAULT '0',
  `exchangerType` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `exchangerId` int(11) NOT NULL,
  `phone` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `extend` int(11) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `value` int(11) NOT NULL DEFAULT '0',
  `bid` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `type` int(11) DEFAULT '0',
  `customerId` int(11) DEFAULT NULL,
  `chargeType` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'balance',
  `taskid` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `transactionId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `paymentMethodId` int(11) DEFAULT NULL,
  `totalIntegral` int(11) DEFAULT '0',
  `exchangeIntegral` decimal(10,2) DEFAULT '0.00',
  `productType` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `out_trade_no` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `extract_orders_state` (`state`),
  KEY `extract_orders_exchanger_type` (`exchangerType`),
  KEY `extract_orders_exchanger_id` (`exchangerId`),
  KEY `extract_orders_phone` (`phone`),
  KEY `extract_orders_bid` (`bid`),
  KEY `extract_orders_type` (`type`),
  KEY `extract_orders_customer_id` (`customerId`),
  KEY `extract_orders_charge_type` (`chargeType`),
  KEY `extract_orders_transaction_id` (`transactionId`),
  KEY `extract_orders_taskid` (`taskid`)
) ENGINE=InnoDB AUTO_INCREMENT=2232 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `FlowHistories`
--

DROP TABLE IF EXISTS `FlowHistories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `FlowHistories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customerId` int(11) NOT NULL,
  `state` int(11) NOT NULL,
  `type` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `typeId` int(11) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `comment` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `trafficType` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'remainingTraffic',
  PRIMARY KEY (`id`),
  KEY `flow_histories_customer_id` (`customerId`),
  KEY `flow_histories_state` (`state`),
  KEY `flow_histories_type` (`type`),
  KEY `flow_histories_type_id` (`typeId`),
  KEY `flow_histories_traffic_type` (`trafficType`)
) ENGINE=InnoDB AUTO_INCREMENT=2750 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `FlowTasks`
--

DROP TABLE IF EXISTS `FlowTasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `FlowTasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `seller_id` int(11) NOT NULL,
  `title` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `cover` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8_unicode_ci,
  `finishTime` int(11) NOT NULL DEFAULT '0',
  `expiredAt` datetime NOT NULL,
  `sortNum` int(11) NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `actionUrl` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `trafficPlanId` int(11) NOT NULL,
  `digest` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `flow_tasks_seller_id` (`seller_id`),
  KEY `flow_tasks_expired_at` (`expiredAt`),
  KEY `flow_tasks_sort_num` (`sortNum`),
  KEY `flow_tasks_is_active` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Levels`
--

DROP TABLE IF EXISTS `Levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Levels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `discount` float DEFAULT '0',
  `extend` int(11) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `code` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `levels_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MessageQueues`
--

DROP TABLE IF EXISTS `MessageQueues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MessageQueues` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `phone` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `content` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `state` int(11) NOT NULL DEFAULT '0',
  `type` int(11) DEFAULT NULL,
  `verificationCode` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `sendAt` datetime DEFAULT NULL,
  `retryTime` int(11) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `templateId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MessageTemplates`
--

DROP TABLE IF EXISTS `MessageTemplates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MessageTemplates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8_unicode_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `message_templates_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Orders`
--

DROP TABLE IF EXISTS `Orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `state` int(11) NOT NULL DEFAULT '0',
  `customerId` int(11) NOT NULL,
  `dataPlanId` int(11) NOT NULL,
  `paymentMethodId` int(11) NOT NULL,
  `discount` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `transactionId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PaymentMethods`
--

DROP TABLE IF EXISTS `PaymentMethods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PaymentMethods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `code` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Sellers`
--

DROP TABLE IF EXISTS `Sellers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Sellers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `accessToken` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `company` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `homepage` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `qq` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sellerAccessTokenIndex` (`accessToken`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SequelizeMeta`
--

DROP TABLE IF EXISTS `SequelizeMeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SequelizeMeta` (
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TrafficGroups`
--

DROP TABLE IF EXISTS `TrafficGroups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `TrafficGroups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `providerId` int(11) DEFAULT NULL,
  `sortNum` int(11) NOT NULL DEFAULT '0',
  `display` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `traffic_groups_provider_id` (`providerId`),
  KEY `traffic_groups_sort_num` (`sortNum`),
  KEY `traffic_groups_display` (`display`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TrafficPlans`
--

DROP TABLE IF EXISTS `TrafficPlans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `TrafficPlans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `providerId` int(11) NOT NULL,
  `value` int(11) NOT NULL DEFAULT '0',
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `sortNum` int(11) DEFAULT '0',
  `display` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `type` int(11) DEFAULT '0',
  `bid` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `trafficGroupId` int(11) DEFAULT NULL,
  `purchasePrice` decimal(10,2) NOT NULL,
  `integral` int(11) DEFAULT '0',
  `productType` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `traffic_plans_provider_id` (`providerId`),
  KEY `traffic_plans_sort_num` (`sortNum`),
  KEY `traffic_plans_display` (`display`),
  KEY `traffic_plans_type` (`type`),
  KEY `traffic_plans_bid` (`bid`),
  KEY `traffic_plans_traffic_group_id` (`trafficGroupId`)
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `salt` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usernameIndex` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `WechatMenus`
--

DROP TABLE IF EXISTS `WechatMenus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `WechatMenus` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `event` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `key` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `url` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `sortNum` int(11) DEFAULT NULL,
  `ancestryDepth` int(11) NOT NULL DEFAULT '0',
  `ancestry` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `wechat_menus_sort_num` (`sortNum`),
  KEY `wechat_menus_ancestry` (`ancestry`),
  KEY `wechat_menus_ancestry_depth` (`ancestryDepth`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `WechatReplies`
--

DROP TABLE IF EXISTS `WechatReplies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `WechatReplies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `content` text COLLATE utf8_unicode_ci,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `wechat_replies_key` (`key`),
  KEY `wechat_replies_is_active` (`isActive`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Withdrawals`
--

DROP TABLE IF EXISTS `Withdrawals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Withdrawals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `customerId` int(11) NOT NULL,
  `account` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `state` int(11) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `phone` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `comment` text COLLATE utf8_unicode_ci,
  `remark` text COLLATE utf8_unicode_ci,
  `cost` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `withdrawals_customer_id` (`customerId`),
  KEY `withdrawals_state` (`state`),
  KEY `withdrawals_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-07-03 23:46:44
