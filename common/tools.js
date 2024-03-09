import {
	store
} from '@/uni_modules/uni-id-pages/common/store.js'
const db = uniCloud.database();
const dbCmd = db.command;
export default {
	// 根据 ip 拿到省份
	async getIPInfo(ipAddress) {
		try {
			const res = await uni.request({
				url: `http://opendata.baidu.com/api.php?query=${ipAddress}&co=&resource_id=6006&oe=utf8`,
				method: 'GET',
			})

			// if (res[1].data.status !== 0) {
			// 	throw new Error('无法 获取数据');
			// }

			const ip_region = this.getFirstTwoCharacters(res[1].data.data[0].location)
			return ip_region
		} catch (error) {
			// console.log("error", error);
			console.error(`获取IP地址信息时出错：${error.message}`);
			return null;
		}
	},

	getFirstTwoCharacters(inputString) {
		if (typeof inputString === 'string' && inputString.length >= 2) {
			return inputString.substring(0, 2);
		} else {
			return null; // 或者返回其他适当的值，表示输入无效
		}
	},

	// 获取今天的日期字符串
	getTodayDate() {
		const today = new Date();
		const year = today.getFullYear();
		let month = today.getMonth() + 1;
		let day = today.getDate();

		// 补零操作，确保月份和日期是两位数
		month = month < 10 ? '0' + month : month;
		day = day < 10 ? '0' + day : day;

		return `${year}.${month}.${day}`;
	},

	// 过滤url
	extractQueryParams(args) {
		let params = {};
		// 提取 URL 中的查询字符串部分
		let queryString = args.split('?')[1];

		if (queryString) {
			// 分割查询字符串为单独的键值对
			let pairs = queryString.split('&');

			for (let i = 0; i < pairs.length; i++) {
				let pair = pairs[i].split('=');

				// 解码并存储每个查询参数
				if (pair.length === 2) {
					params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
				}
			}
		}

		return params;
	},

	// 判断字符串是否为url
	isURL(str) {
		// 创建一个正则表达式模式来匹配URL
		let urlPattern = new RegExp(
			'^(https?:\\/\\/)?' + // 协议
			'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // 域名
			'((\\d{1,3}\\.){3}\\d{1,3}))' + // 或者IP地址
			'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // 端口和路径
			'(\\?[;&a-z\\d%_.~+=-]*)?' + // 查询字符串
			'(\\#[-a-z\\d_]*)?$',
			'i'
		);
		// 使用正则表达式模式测试传入的字符串
		return urlPattern.test(str);
	},

	// 计算两个时间戳之间会经历多少周，timestampA < timestampB
	calculateWeeks(timestampA, timestampB) {
		if (typeof timestampA === 'string') {
			timestampA = this.stringToTimestamp(timestampA);
		}

		if (typeof timestampB === 'string') {
			timestampB = this.stringToTimestamp(timestampB);
		}
		// console.log("timestampA", timestampA);
		// console.log("timestampB", timestampB);

		// timestampA = 1703174400000
		// timestampB = 1703952000000

		// 拿到这俩时间戳之间的星期数  dayA和dayB
		let dayA = this.getDayOfWeek(timestampA)
		let dayB = this.getDayOfWeek(timestampB)
		// console.log("dayA", dayA);
		// console.log("dayB", dayB);

		const millisecondsInWeek = 604800000; // 一周的毫秒数

		// const startOfWeekA = timestampA - (timestampA % millisecondsInWeek); // A 所在周的起始时间戳
		// const startOfWeekB = timestampB - (timestampB % millisecondsInWeek); // B 所在周的起始时间戳

		// console.log("startOfWeekB", startOfWeekB);
		// console.log("startOfWeekA", startOfWeekA);

		let weeksDifference = (Math.abs(timestampB - timestampA) / millisecondsInWeek) + 1; // 计算周数差值

		if (dayA > dayB) {
			weeksDifference++
		}
		// console.log("weeksDifference", parseInt(weeksDifference));
		return parseInt(weeksDifference)
	},

	// 返回这个时间戳是星期几
	getDayOfWeek(timestamp) {
		const date = new Date(timestamp);
		let dayOfWeek = date.getDay();

		// 如果是周日 (getDay() 返回 0)，将其转换为 7
		if (dayOfWeek === 0) {
			dayOfWeek = 7;
		}

		return dayOfWeek;
	},

	addDaysToTimestamp(timestamp, days) {
		const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // 一天的毫秒数
		const resultTimestamp = timestamp + days * oneDayInMilliseconds;
		return resultTimestamp;
	},

	// 权限
	// 安卓权限
	checkNotificationPermission() {
		// #ifdef APP
		this.isIos = (uni.getSystemInfoSync().platform == "ios")
		if (this.isIos) {
			// console.log("我是apple");
			var UIApplication = plus.ios.import("UIApplication");
			var app = UIApplication.sharedApplication();
			var enabledTypes = 0;
			if (app.currentUserNotificationSettings) {
				var settings = app.currentUserNotificationSettings();
				enabledTypes = settings.plusGetAttribute("types");
				// console.log("enabledTypes1:" + enabledTypes);
				if (enabledTypes == 0) { //如果enabledTypes = 0 就是通知权限没有开启
					this.tongzhi = true; //这里是我写的一个弹窗上面有一个跳转开启的按钮，自行添加即可

					uni.showModal({
						title: '未授权通知',
						content: '点击确定后开启通知，即可收到消息提醒！',
						success: function(res) {
							if (res.confirm) {
								var UIApplication = plus.ios.import("UIApplication");
								var app = UIApplication.sharedApplication();
								var settings = app.currentUserNotificationSettings();
								enabledTypes = settings.plusGetAttribute("types");
								var NSURL2 = plus.ios.import("NSURL");
								var setting2 = NSURL2.URLWithString("app-settings:");
								var application2 = UIApplication.sharedApplication();
								application2.openURL(setting2);
								plus.ios.deleteObject(setting2);
								plus.ios.deleteObject(NSURL2);
								plus.ios.deleteObject(application2);
								plus.ios.deleteObject(settings);
							}
						}.bind(this)
					})
				}
			}
			plus.ios.deleteObject(settings)
		} else {
			// console.log("我是安卓");
			var main = plus.android.runtimeMainActivity();
			var pkName = main.getPackageName();
			var uid = main.getApplicationInfo().plusGetAttribute("uid");

			var NotificationManagerCompat = plus.android.importClass(
				"android.support.v4.app.NotificationManagerCompat"
			);
			//android.support.v4升级为androidx
			if (NotificationManagerCompat == null) {
				NotificationManagerCompat = plus.android.importClass(
					"androidx.core.app.NotificationManagerCompat"
				);
			}
			var areNotificationsEnabled =
				NotificationManagerCompat.from(main).areNotificationsEnabled();

			// 未开通‘允许通知’权限，则弹窗提醒开通，并点击确认后，跳转到系统设置页面进行设置
			if (!areNotificationsEnabled) {
				this.tongzhi = true; //这里也一样未开启权限，弹出弹窗

				uni.showModal({
					title: '未授权通知',
					content: '点击确定后开启通知，即可收到自习室提醒！',
					success: function(res) {
						if (res.confirm) {
							// 跳转到通知
							var Intent = plus.android.importClass("android.content.Intent");
							var Build = plus.android.importClass("android.os.Build");
							//android 8.0引导
							if (Build.VERSION.SDK_INT >= 26) { //判断安卓系统版本
								var intent = new Intent("android.settings.APP_NOTIFICATION_SETTINGS");
								intent.putExtra("android.provider.extra.APP_PACKAGE", pkName);
							} else if (Build.VERSION.SDK_INT >= 21) { //判断安卓系统版本
								//android 5.0-7.0
								var intent = new Intent("android.settings.APP_NOTIFICATION_SETTINGS");
								intent.putExtra("app_package", pkName);
								intent.putExtra("app_uid", uid);
							} else {
								//(<21)其他--跳转到该应用管理的详情页
								intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
								var uri = Uri.fromParts(
									"package",
									mainActivity.getPackageName(),
									null
								);
								intent.setData(uri);
							}
							// 跳转到该应用的系统通知设置页
							main.startActivity(intent);
						}

					}.bind(this)
				})
			}
		}
		// #endif
	},

	async requestAndroidPermission(permisionID) {
		var result = await permision.requestAndroidPermission(permisionID)
		return result
	},

	// 苹果权限
	judgeIosPermission: function(permisionID) {
		var result = permision.judgeIosPermission(permisionID)
		var strStatus = (result) ? "已" : "未"
		uni.showModal({
			content: permisionID + '权限' + strStatus + "获得授权",
			showCancel: false
		});
	},

	// 权限融合
	judgePermission(permisionID) {
		// #ifdef APP
		this.isIos = (plus.os.name == "iOS")
		if (this.isIos) {
			this.judgeIosPermission(permisionID)
		} else {
			this.requestAndroidPermission(permisionID)
		}
		// #endif
	},

	generateOrderNumber() {
		const timestamp = Date.now().toString(36);
		const randomNum = Math.floor(Math.random() * 10000).toString(36).padStart(4, '0');
		const randomLetters = this.generateRandomLetters(8); // 生成8位随机字母
		return timestamp + randomNum + randomLetters;
	},

	generateRandomLetters(length) {
		const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		let randomLetters = '';
		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * letters.length);
			randomLetters += letters.charAt(randomIndex);
		}
		return randomLetters;
	},

	// 判断这个时间戳距离现在是否一个月了
	isOneMonthAgo(timestamp) {
		// 用户如果没有设置过才返回 true
		if (typeof timestamp === 'undefined' || timestamp === null) {
			return true; // 如果时间戳为 undefined，返回 false
		}

		return false; // 如果时间戳为 undefined，返回 false

		// const currentDate = new Date();
		// const givenDate = new Date(timestamp);

		// // 计算日期差
		// const yearDiff = currentDate.getFullYear() - givenDate.getFullYear();
		// const monthDiff = currentDate.getMonth() - givenDate.getMonth();
		// const dayDiff = currentDate.getDate() - givenDate.getDate();

		// // 计算总天数差
		// const totalDaysDiff = yearDiff * 365 + monthDiff * 30 + dayDiff;

		// // 如果总天数差大于等于30，则已相差一个月
		// return totalDaysDiff >= 30;
	},

	// 判断传入的时间戳是否为今天的时间戳
	isTimestampInRange(timestamp) {
		if (!timestamp) {
			return false;
		}

		const now = new Date(); // 获取当前时间
		const todayStart = new Date(now);
		todayStart.setHours(0, 0, 0, 0); // 设置为今天的凌晨00:00:00.000
		const tomorrowStart = new Date(now);
		tomorrowStart.setDate(tomorrowStart.getDate() + 1);
		tomorrowStart.setHours(0, 0, 0, 0); // 设置为明天的凌晨00:00:00.000

		return timestamp >= todayStart.getTime()
	},

	// 获取当前字符串日期的北京时间00:00的时间戳
	// 例如获取 2023-06-05 的时间戳，转换过来就是 2023-06-05 00:00
	getBeijingTime(dateStr) {
		// 将字符串转换为日期对象
		const dateObj = new Date(dateStr);

		// 设置日期对象的时间为 00:00:00
		dateObj.setHours(0, 0, 0, 0);

		// 将日期对象转换为北京时间（UTC+8）
		return dateObj.getTime() + (dateObj.getTimezoneOffset() + 480) * 60 * 1000;

	},

	// 稍等一下
	waitToast() {
		uni.showToast({
			title: '稍等一下~',
			icon: 'none',
			duration: 1000,
		});
	},

	/**
	 * 获取当前时间的时间戳
	 */
	getTimestamp() {
		// 获取当前时间的时间戳（UTC时间）
		const currentTimestamp = Date.now();

		// 转换为北京时间的时间戳
		return currentTimestamp + (8 * 60 * 60 * 1000);
	},

	/**
	 * 把时间戳转换成当天 00:00 的时间戳
	 */
	timestampChange(timestamp) {
		let date = new Date(timestamp);
		date.setHours(0, 0, 0, 0);
		return date.getTime();
	},

	// 转换成当天23:59的时间戳
	timestampTodayChange(timestamp) {
		let date = new Date(timestamp);
		date.setHours(23, 59, 59, 59);
		return date.getTime();
	},

	/**
	 * 把时间戳转换成字符串 2023.06.02
	 * @param {Object} timestamp: 待转换的时间戳
	 */
	timestampSwitch(timestamp) {
		// 创建一个 Date 对象并传入时间戳
		const dateObj = new Date(timestamp);

		// 获取年、月、日、小时和分钟
		const year = dateObj.getFullYear();
		const month = String(dateObj.getMonth() + 1).padStart(2, '0');
		const day = String(dateObj.getDate()).padStart(2, '0');

		// 构建日期字符串
		return `${year}/${month}/${day}`;
	},

	// 更新挑战任务的状态
	async refreshChallengeState1(challenge_task) {
		let old_last_days = challenge_task.last_days
		let today_date = this.getBeijingMidnightTimestamp()
		let end_date = challenge_task.end_date

		// 查看剩余天数是否正常
		let new_last_days = 0
		if (challenge_task.is_daka > today_date) {
			new_last_days = this.DateDiff2(today_date, end_date)
		} else {
			new_last_days = this.DateDiff2(today_date, end_date) + 1
		}

		// 如果两个last_days不相等，则更新
		if (new_last_days !== old_last_days) {
			if (new_last_days < 0) {
				new_last_days = 0
			}

			challenge_task.last_days = new_last_days
			// await challenge.updateLastDays(challenge_task._id, new_last_days)
		}

		// 拿到初始变量
		let time_now = this.getCurrentTimestamp()
		let is_monday = this.isMonday()
		let monday_date = is_monday[1]
		let last_monday_date = is_monday[2]
		let is_last_week_fisrt_week = false

		// 拿到用户一周要打卡几次
		let weekly_need_daka_days = 7
		if (challenge_task.weekly_need_daka_days !== undefined) {
			weekly_need_daka_days = challenge_task.weekly_need_daka_days
		}

		// 拿到用户这周跟上周打卡了几天
		let weekly_daka_days = 0
		let last_weekly_daka_days = 0
		// console.log("monday_date", monday_date);
		// console.log("challenge_task.daka_data", challenge_task.daka_data);
		for (var i = challenge_task.daka_data.length - 1; i >= 0; i--) {
			// console.log("challenge_task.daka_data[i].daka_date", challenge_task.daka_data[i].daka_date);
			if (monday_date <= challenge_task.daka_data[i].daka_date) {
				weekly_daka_days++
			} else if (last_monday_date <= challenge_task.daka_data[i].daka_date) {
				last_weekly_daka_days++
			} else {
				break
			}
		}

		// console.log("-------------------");

		// 如果拿到的打卡天数不同就更新一下
		if (weekly_daka_days !== challenge_task.weekly_daka_days) {
			await challenge.updateWeeklyDakaDays(challenge_task._id, weekly_daka_days, weekly_need_daka_days)
		}

		// 判断当前挑战是否处于创建后的第一周
		let is_first_week = false
		if (monday_date < this.stringToTimestamp(challenge_task.start_date)) {
			// 说明过了一周了
			is_first_week = true
		} else if (last_monday_date < this.stringToTimestamp(challenge_task.start_date)) {
			// 判断上周是否为第一周
			is_last_week_fisrt_week = true
		}
		// 是否为第一个星期
		// challenge_task.is_first_week = is_first_week

		// 拿到这周已经过去几天了
		let weekly_past_days = 0
		if (is_first_week) {
			weekly_past_days = this.DateDiff2(challenge_task.start_date, today_date)
		} else {
			weekly_past_days = this.DateDiff2(monday_date, today_date)
		}

		// 1. 拿到用户本周有几天没打卡 = 过了几天 - 打卡几天
		let not_daka_days = weekly_past_days - weekly_daka_days
		// 当天为周一的话，打了卡not_daka_days会变成-1
		if (not_daka_days < 0) {
			not_daka_days = 0
		}

		// 2. 拿到用户本周最多可以几天不打卡 = 7 - 每天要打卡几天
		let weekly_can_not_daka_days = 7 - weekly_need_daka_days

		// 3. 拿到本周还可以休息的天数
		let weekly_days_off = 0

		// 4. 挑战成功
		let is_success = false
		// 判断是否为最后一周
		let is_last_week = this.calculateWeeks(today_date, challenge_task.end_date)
		let last_all_day = 0
		if (is_last_week === 1) {
			// 拿到最后一周的周一时间戳  monday_date
			// 拿到挑战结束的时间戳  end_date
			// 拿到周一到挑战结束之间剩余多少天  last_all_day
			// 拿到每周要打卡的天数  weekly_need_daka_day
			if (monday_date < challenge_task.start_date) {
				last_all_day = this.DateDiff2(challenge_task.start_date, challenge_task.end_date) + 1
			} else {
				last_all_day = this.DateDiff2(monday_date, challenge_task.end_date) + 1
			}
			// 判断每周要打卡的天数 > last_all_day
			if (weekly_need_daka_days > last_all_day) {
				// 则成功的条件为本周打卡的天数 === last_all_day
				is_success = weekly_daka_days === last_all_day
				weekly_days_off = 0
			} else {
				weekly_days_off = weekly_can_not_daka_days - not_daka_days
				// 拿到需要经历多少周  x
				let calculateWeeks = this.calculateWeeks(challenge_task.start_date, challenge_task.end_date)
				// 拿到每周需要打卡多少天  n  weekly_need_daka_days
				// 拿到已打卡的天数  z  now_daka_days
				is_success = challenge_task.accumulate_days >= (calculateWeeks * weekly_need_daka_days)
			}
		} else {
			weekly_days_off = weekly_can_not_daka_days - not_daka_days
		}

		// 5. 挑战失败 = 拿到用户本周有几天没打卡 > 拿到用户本周最多可以几天不打卡
		let is_fail = false
		// 如果这一周不是第一周，也不是最后一周，且这一周的上一周不是第一周
		if (is_last_week !== 1 && !is_first_week && !is_last_week_fisrt_week) {
			is_fail = (not_daka_days > weekly_can_not_daka_days) || (last_weekly_daka_days < weekly_need_daka_days)
		} else if (is_last_week === 1) {
			// 如果是最后一周，则判断是否需要全部打满
			if (weekly_need_daka_days > last_all_day) {
				// 则需要全部打满，否则就失败，换句话说就是不能有一天没打卡
				is_fail = not_daka_days > 0
			} else {
				is_fail = not_daka_days > weekly_can_not_daka_days
			}
		} else {
			is_fail = not_daka_days > weekly_can_not_daka_days
		}

		// 看看休息天数是否一致
		if (weekly_days_off !== challenge_task.weekly_days_off) {
			await challenge.updateWeeklyDaysOff(challenge_task._id, weekly_days_off)
		}

		// console.log("is_success", is_success);
		// console.log("is_last_week", is_last_week);
		// console.log("challenge_task.title", challenge_task.title);

		// console.log("challenge_task", challenge_task);
		// console.log("challenge_task.title", challenge_task.title);
		// console.log("is_last_week_fisrt_week", is_last_week_fisrt_week);
		// console.log("weekly_days_off", weekly_days_off);
		// console.log("is_first_week", is_first_week);
		// console.log("is_last_week", is_last_week);
		// console.log("monday_date", monday_date);
		// console.log("today_date", today_date);
		// console.log("weekly_past_days", weekly_past_days);
		// console.log("weekly_daka_days", weekly_daka_days);
		// console.log("not_daka_days", not_daka_days);
		// console.log("weekly_need_daka_days", weekly_need_daka_days);
		// console.log("weekly_can_not_daka_days", weekly_can_not_daka_days);
		// console.log("is_fail", is_fail);
		// console.log("---------------------------");

		if (is_fail) {
			// 更改本地任务的状态，并更新云函数
			challenge_task.state = 3
			challenge_task.fail_date = time_now
			uniCloud.callFunction({
				name: 'challenge-update-state',
				data: {
					_id: challenge_task._id,
					state: 3,
					fail_date: time_now
				}
			})

			// 修改房间内挑战的状态
			let res = await db.collection('jiandu_tajianduwo').where({
				'need_jiandu._id': challenge_task._id
			}).get()

			if (res.result.data.length !== 0) {
				// 说明有绑定，循环使得这些房间中的打卡变成已打卡
				let room_list = res.result.data
				for (var i = 0; i < room_list.length; i++) {
					for (var j = 0; j < room_list[i].need_jiandu.length; j++) {
						if (room_list[i].need_jiandu[j]._id === challenge_task._id) {
							room_list[i].need_jiandu[j].state = -100
							let res2 = await jiandu.updateRoomNeedJiandu(room_list[i].need_jiandu, room_list[i]._id)
							break
						}
					}
				}
			}
		} else if (is_success) {
			challenge_task.state = 1
			// 挑战成功
			challenge.success(challenge_task._id).then(async res_success => {
				// 修改房间内挑战的状态
				// console.log("res_success", res_success);
				let res = await db.collection('jiandu_tajianduwo').where({
					'need_jiandu._id': challenge_task._id
				}).get()
				// console.log("res.result.data", res.result.data);
				if (res.result.data.length !== 0) {
					// 说明有绑定，循环使得这些房间中的打卡变成已打卡
					let room_list = res.result.data

					for (var i = 0; i < room_list.length; i++) {
						for (var j = 0; j < room_list[i].need_jiandu.length; j++) {
							if (room_list[i].need_jiandu[j]._id === challenge_task._id) {
								room_list[i].need_jiandu[j].state = 100
								await jiandu.updateRoomNeedJiandu(room_list[i].need_jiandu, room_list[i]
									._id)
								break
							}
						}
					}
				}

				// 给予奖励
				await this.judgeRewards(challenge_task)
			})
		}

		return challenge_task
	},

	// 判断用户是否达到了奖励的标准
	async judgeRewards(old_challenge) {
		let challenge_id = old_challenge._id
		let challenge_zongzi = old_challenge.zongzi
		// console.log("old_challenge", old_challenge);
		// console.log("challenge_id", challenge_id);
		// console.log("challenge_zongzi", challenge_zongzi);
		if (challenge_zongzi) {
			let new_coin_num = await money.challengeZongziRewards(challenge_id)
			// console.log("new_coin_num", new_coin_num);
			uni.setStorageSync('coin_num', new_coin_num)
			uni.setStorageSync('refresh_zongzi_num', true)
		} else {
			money.challengeRewards(challenge_id)
		}
	},

	getCurrentTimestamp() {
		const now = new Date();
		const timestampInMilliseconds = now.getTime();
		return timestampInMilliseconds;
	},

	// 更新挑战任务的状态
	refreshChallengeState(challenge_task) {
		// 判断一下是否为打卡失败
		// 先拿到这个任务的累计打卡天数
		let temp_accumulate_days = challenge_task.accumulate_days
		// 拿到任务的总共的天数
		let temp_start_date = challenge_task.start_date
		let temp_end_date = challenge_task.end_date
		if (temp_start_date < this.dateToday()) {
			let total_DateDiff = this.DateDiff2(temp_start_date, temp_end_date)
			// 计算今天到最后一天剩余的总天数
			let today_DateDiff = this.DateDiff2(this.dateToday(), temp_end_date)
			// 总天数-剩余总天数 != 累计天数  =>  打卡失败
			let temp_days = total_DateDiff - today_DateDiff
			// temp_diff = 1，这说明已打卡，temp_diff = 0，说明未打卡
			let temp_diff = temp_accumulate_days - temp_days
			if (challenge_task.state == 0 || challenge_task.state == 1) {
				if (temp_diff > 1) {
					// 更改本地任务的状态，并更新云函数
					challenge_task.state = 3

					uniCloud.callFunction({
						name: 'challenge-update-state',
						data: {
							_id: challenge_task._id,
							state: 3
						}
					})
				}
			}
		}
		return challenge_task
	},

	// 计算两个时间戳相隔天数
	/**
	 * @param {Object} sDate1: 时间早的那个
	 * @param {Object} sDate2: 时间晚的那个
	 */
	DateDiff2(sDate1, sDate2) {
		// 判断是否为 "xxxx.xx.xx" 形式的字符串
		const datePattern = /^\d{4}\.\d{2}\.\d{2}$/;

		if (typeof sDate1 === 'string' && datePattern.test(sDate1)) {
			// 如果都是 "xxxx.xx.xx" 形式的字符串，进行转换
			sDate1 = sDate1.replace(/\./g, '-');
		}

		if (typeof sDate2 === 'string' && datePattern.test(sDate2)) {
			// 如果都是 "xxxx.xx.xx" 形式的字符串，进行转换
			sDate2 = sDate2.replace(/\./g, '-');
		}

		let date1 = new Date(sDate1);
		let date2 = new Date(sDate2);

		// 忽略时分秒，仅比较日期部分
		date1.setHours(0, 0, 0, 0);
		date2.setHours(0, 0, 0, 0);

		let timestamp1 = date1.getTime() // 加上8小时的偏移量
		let timestamp2 = date2.getTime() // 加上8小时的偏移量

		let iDays = parseInt(Math.abs(timestamp2 - timestamp1) / 1000 / 60 / 60 / 24);

		if (sDate1 > sDate2) {
			return -1;
		} else if (sDate1 == sDate2) {
			return 0;
		} else {
			return iDays;
		}
	},

	dateToday() {
		// 创建当前时间的 Date 对象
		let date = new Date();

		// 获取北京时间的时间戳（毫秒）
		let timestamp = date.getTime();
		return timestamp
	},

	timestampToString(timestamp) {
		let date = new Date(timestamp);
		let year = date.getFullYear();
		let month = (date.getMonth() + 1).toString().padStart(2, '0');
		let day = date.getDate().toString().padStart(2, '0');
		return `${year}.${month}.${day}`;
	},

	timestampToString2(timestamp) {
		let date = new Date(timestamp);
		let year = date.getFullYear();
		let month = (date.getMonth() + 1).toString().padStart(2, '0');
		let day = date.getDate().toString().padStart(2, '0');
		return `${year}-${month}-${day}`;
	},

	stringToTimestamp(dateStr) {
		// 如果 dateStr 是时间戳，直接创建日期对象
		if (typeof dateStr === 'number') {
			const date = new Date(dateStr);

			// 设置日期的小时和分钟为北京时间的0:00
			date.setHours(0, 0, 0, 0);

			// 获取北京时间的时间戳（毫秒为单位）
			return date.getTime();
		}

		// console.log("dateStr", dateStr);
		// 使用正则表达式检查日期字符串是否符合标准格式 "YYYY-MM-DD"
		const standardFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
		// console.log("!standardFormatRegex.test(dateStr)", standardFormatRegex.test(dateStr));
		if (!standardFormatRegex.test(dateStr)) {
			// 如果日期字符串不符合标准格式，则尝试转换为标准格式 "YYYY-MM-DD"
			const parts = dateStr.split('.');
			if (parts.length === 3) {
				const year = parts[0];
				const month = parts[1];
				const day = parts[2];

				// 构建标准格式日期字符串
				dateStr = `${year}-${month}-${day}`;
			} else {
				// 如果无法转换，返回一个默认的日期或抛出错误，根据您的需求
				// 例如：dateStr = "2023-09-09" 或抛出错误
				dateStr = "2023-09-09";
			}
		}

		// 创建日期对象
		const date = new Date(dateStr);

		// 设置日期的小时和分钟为北京时间的0:00
		date.setHours(0, 0, 0, 0);

		// 获取北京时间的时间戳（毫秒为单位）
		return date.getTime();
	},

	// 获取当前日期的北京时间的 00:00 的时间戳
	getBeijingMidnightTimestamp() {
		// 获取当前时间
		const now = new Date();
		// 设置北京时间偏移量，北京时间比UTC时间快8小时
		now.setHours(0, 0, 0, 0);
		// 获取北京时间00:00的毫秒级时间戳
		const timestampInMilliseconds = now.getTime();

		return timestampInMilliseconds;
	},

	// 获取明天日期的北京时间的 00:00 的时间戳
	getNextdayBeijingTimestamp() {
		const date = new Date(); // 获取当前日期和时间
		date.setDate(date.getDate() + 1); // 将日期设置为当前日期的下一天
		const year = date.getFullYear(); // 获取年份
		const month = date.getMonth() + 1; // 获取月份（注意：月份从 0 开始，需要加 1）
		const day = date.getDate(); // 获取日期

		// 创建一个新的日期对象，设置为当前日期的下一天的北京时间的 00:00:00
		const beijingNextDayMidnight = new Date(`${year}-${month}-${day} 00:00:00 GMT+0800`);

		// 获取北京时间的下一天的 00:00 的时间戳
		const timestamp = beijingNextDayMidnight.getTime();

		return timestamp;
	},

	daysBetweenDates(timestamp1, timestamp2) {
		// Convert timestamps to Date objects
		const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
		const date1 = new Date(timestamp1);
		const date2 = new Date(timestamp2);

		// Calculate the difference in milliseconds
		const diffMilliseconds = Math.abs(date1 - date2);

		// Convert milliseconds to days
		const diffDays = Math.round(diffMilliseconds / oneDay);

		return diffDays;
	},

	/**
	 * 判断今天是否为周一
	 * 返回的是一个数组[true/false，周一时间戳]
	 */
	// isMonday() {
	// 	if (new Date().getDay() === 1) {
	// 		// 如果是周一，就获取当天的时间戳返回
	// 		return [true, this.getBeijingMidnightTimestamp(), this.getLastMondayTimestamp()]

	// 	} else {
	// 		// 不是周一，则返回当前这一周的周一时间戳
	// 		const currentDate = new Date();
	// 		const currentDay = currentDate.getDay();
	// 		const timestamp = currentDate.getTime();
	// 		const daysToMonday = (currentDay + 6) % 7; // 计算距离周一的天数
	// 		const mondayTimestamp = timestamp - daysToMonday * 24 * 60 * 60 * 1000; // 减去相应的毫秒数
	// 		const mondayDate = new Date(mondayTimestamp);
	// 		mondayDate.setHours(0, 0, 0, 0); // 设置为当天的 00:00:00
	// 		return [false, mondayDate.getTime(), this.getLastMondayTimestamp()];
	// 	}
	// },
	isMonday() {
		const currentDay = new Date().getDay();

		if (currentDay === 1) {
			// 如果是周一，就获取当天的时间戳返回
			return [true, this.getBeijingMidnightTimestamp(), this.getLastMondayTimestamp()];
		} else {
			// 不是周一，则返回当前这一周的周一时间戳
			const mondayTimestamp = this.getMondayTimestamp();
			// console.log("[isMonday, mondayTimestamp]", [isMonday, mondayTimestamp]);
			return [false, mondayTimestamp, this.getLastMondayTimestamp()];
		}
	},

	// 提取获取上周一时间戳的逻辑为一个单独的方法
	getLastMondayTimestamp() {
		const currentDate = new Date();
		const currentDay = currentDate.getDay();
		const timestamp = currentDate.getTime();
		const daysToMonday = (currentDay + 6) % 7; // 计算距离周一的天数
		const mondayTimestamp = timestamp - daysToMonday * 24 * 60 * 60 * 1000; // 减去相应的毫秒数
		const mondayDate = new Date(mondayTimestamp);
		mondayDate.setHours(0, 0, 0, 0); // 设置为当天的 00:00:00
		return [mondayTimestamp, mondayDate];
	},

	// 获取本周周一的时间戳
	getMondayTimestamp() {
		const currentDate = new Date();
		// 获取今天是周几，注意周日返回的是0
		const currentDay = currentDate.getDay();
		// 计算到周一的天数差（如果今天是周日，需要特殊处理）
		const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;

		// 设置日期为本周一
		currentDate.setDate(currentDate.getDate() - daysToMonday);
		// 设置时间为00:00:00
		currentDate.setHours(0, 0, 0, 0);

		// 返回时间戳
		return currentDate.getTime();
	},

	getWeekdayTimestamp(weekday) {
		const now = new Date();
		const currentDay = now.getDay(); // 获取当前是星期几，0表示周日，1表示周一，依次类推

		// 计算需要偏移的天数
		const offsetDays = weekday - currentDay;
		if (offsetDays === 0) {
			// 如果需要获取当前星期的时间戳，则直接返回今天的00:00时间戳
			now.setHours(0, 0, 0, 0);
		} else {
			// 否则根据偏移天数计算目标日期的时间戳
			now.setDate(now.getDate() + offsetDays);
			now.setHours(0, 0, 0, 0);
		}

		// 获取目标日期的时间戳（毫秒级）
		const timestampInMilliseconds = now.getTime();
		return timestampInMilliseconds;
	},

	getNextWeekMondayTimestamp() {
		const now = new Date();
		const currentDay = now.getDay(); // 获取当前是星期几，0表示周日，1表示周一，依次类推

		// 计算需要偏移的天数，使得偏移后的日期为下周一
		let offsetDays = 8 - currentDay;
		if (offsetDays === 1) {
			// 当当前为周日时，需要额外偏移一天
			offsetDays += 1;
		}

		// 计算目标日期的时间戳
		now.setDate(now.getDate() + offsetDays);
		now.setHours(0, 0, 0, 0);

		// 获取目标日期的时间戳（毫秒级）
		const timestampInMilliseconds = now.getTime();
		return timestampInMilliseconds;
	},

	// 获取上周一的时间戳（00:00）
	getLastMondayTimestamp() {
		// 获取当前时间的时间戳（毫秒数）
		const currentTimeStamp = Date.now();

		// 获取当前日期的星期几（0表示周日，1表示周一，以此类推）
		const currentDayOfWeek = new Date(currentTimeStamp).getDay();

		// 计算距离上周一的时间偏移（毫秒数）
		const offsetToLastMonday = ((currentDayOfWeek + 6) % 7 + 7) * 24 * 60 * 60 * 1000;

		// 获取上周一的时间戳（毫秒数）
		const lastMondayTimeStamp = currentTimeStamp - offsetToLastMonday;

		// 获取当前日期的年、月、日
		const currentDate = new Date(lastMondayTimeStamp);
		const currentYear = currentDate.getFullYear();
		const currentMonth = currentDate.getMonth();
		const currentDay = currentDate.getDate();

		// 将时间戳设置为当天 00:00
		const midnightTime = new Date(currentYear, currentMonth, currentDay, 0, 0, 0, 0).getTime();

		// 计算上周一的时间戳
		return midnightTime;
	},

	chargeTime(timestamp) {
		let timestamp_old = new Date(timestamp)
		let timestamp_now = new Date()

		timestamp_old.setHours(0, 0, 0, 0);
		timestamp_now.setHours(0, 0, 0, 0);

		// console.log('timestamp_old', timestamp_old);
		// console.log('timestamp_now', timestamp_now);

		let next_day = new Date(timestamp_old.getTime() + 24 * 60 * 60 * 1000);
		next_day.setHours(0, 0, 0, 0);

		// console.log('next_day', next_day);

		if (timestamp_now >= next_day) {
			// 不是今天的打卡
			return false
		}

		return true
	},

	isTimestampInToday(timestamp) {
		// 创建一个代表今天的日期对象
		const today = new Date();

		// 将时间戳转换为日期对象
		const date = new Date(timestamp);

		// 检查年月日是否与今天相同
		const isSameYear = today.getFullYear() === date.getFullYear();
		const isSameMonth = today.getMonth() === date.getMonth();
		const isSameDay = today.getDate() === date.getDate();

		// 如果年月日都相同，返回true；否则返回false
		return isSameYear && isSameMonth && isSameDay;
	},

	// 获取昨天中午的时间戳
	getYesterdayNoonTimestamp() {
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(today.getDate() - 1); // 设置为昨天
		yesterday.setHours(12, 0, 0, 0); // 设置为中午12:00

		return yesterday.getTime(); // 返回时间戳
	},

	// 更新挑战任务的状态
	async checkChallenge(data) {
		// console.log("data", data);
		// if (data.is_daka != "" && data.state != 1) {
		// 	// console.log("if");
		// 	// 判断这个打卡的时间是否为今天
		// 	// console.log("this.chargeTime(data.is_daka)", this.chargeTime(data.is_daka));
		// 	if (!this.chargeTime(data.is_daka)) {
		// 		// 如果不是今天的任务，就把 is_daka 清空
		// 		data.is_daka = ''
		// 		// 如果是第一天就不要动剩余天数
		// 		if (data.accumulate_days == 0) {
		// 			data.last_days -= 1
		// 		}
		// 		// console.log("data._id", data._id);
		// 		// console.log("data.is_daka", data.is_daka);
		// 		// console.log("data.last_days", data.last_days);
		// 		// console.log("-------------------------------");
		// 		challenge.refreshState(data._id, data.is_daka, data.last_days)
		// 	}
		// 	// 如果这个打卡任务不存在打卡记录
		// } else 
		if (data.state === 0) {
			let today_date = this.getBeijingMidnightTimestamp()

			// 正在挑战并且不是尚未开始
			let start_date_tamp = this.stringToTimestamp(data.start_date)
			let today_date_tamp = new Date().getTime()
			// 如果没打卡，并且任务没结束
			// console.log("data", data);
			// console.log("data.is_daka", data.is_daka);
			// console.log("today_date", today_date);
			if (data.is_daka < today_date && start_date_tamp < today_date_tamp) {
				// 给个方法判断一下每个挑战是否挑战失败
				data = await this.refreshChallengeState1(data)
				// console.log("data", data);
			}
		}
		return data
	},

	// 删除监督文章信息
	deleteJianduArt(art_id) {
		db.collection('jiandu_wojianduta').doc(art_id).remove()
	},

	// 删除监督邀请信息
	deleteInviteInfo(invite_id) {
		db.collection('invite_list').doc(invite_id).remove()
	},

	translateProvince(englishName) {
		// 映射字典，包含英文省份名称到中文名称的映射
		const provinceMap = {
			"Anhui": "安徽",
			"Beijing": "北京",
			"Chongqing": "重庆",
			"Fujian": "福建",
			"Gansu": "甘肃",
			"Guangdong": "广东",
			"Guangxi": "广西",
			"Guizhou": "贵州",
			"Hainan": "海南",
			"Hebei": "河北",
			"Heilongjiang": "黑龙江",
			"Henan": "河南",
			"Hubei": "湖北",
			"Hunan": "湖南",
			"Inner Mongolia": "内蒙古",
			"Jiangsu": "江苏",
			"Jiangxi": "江西",
			"Jilin": "吉林",
			"Liaoning": "辽宁",
			"Ningxia": "宁夏",
			"Qinghai": "青海",
			"Shaanxi": "陕西",
			"Shandong": "山东",
			"Shanghai": "上海",
			"Shanxi": "山西",
			"Sichuan": "四川",
			"Tianjin": "天津",
			"Tibet": "西藏",
			"Xinjiang": "新疆",
			"Yunnan": "云南",
			"Zhejiang": "浙江"
		};

		// 查找映射并返回中文名称，如果找不到则返回原英文名称
		const chineseName = provinceMap[englishName] || englishName;

		return chineseName;
	},

	// ios触感震动
	iosVibrate() {
		// #ifdef APP
		var UIImpactFeedbackGenerator = plus.ios.importClass(
			'UIImpactFeedbackGenerator'
		)
		var impact = new UIImpactFeedbackGenerator()
		impact.prepare()
		impact.init(1)
		impact.impactOccurred()
		// #endif
	},

	ifRefresh(length) {
		if (length % 10 === 0) {
			return length / 10 + 1;
		} else {
			return -1;
		}
	},

	// 更新点赞细节
	addLikeDetail(user_id, like_id, art_id, page, images) {
		if (user_id != like_id) {
			db.collection('like').where({
				art_id: art_id,
				user_id: user_id,
				like_id: like_id
			}).get().then(async res => {
				if (res.result.data.length == 0) {
					await db.collection('like').add({
						user_id: user_id,
						like_id: like_id,
						art_id: art_id,
						page: page,
						images: images,
						is_read: false
					})
				}
			})
		}
	},

	// 更新评论细节
	addCommentDetail(user_id, comment_uid, art_id, comment_content, art_pic, page, comment_id) {
		if (user_id != comment_uid) {
			db.collection('comment').add({
				user_id: user_id,
				comment_uid: comment_uid,
				comment_id: comment_id,
				art_id: art_id,
				page: page,
				comment_content: comment_content,
				art_pic: art_pic,
				is_read: false,
				create_time: Date.now()
			})
		}
	},

	showToast(str, duration) {
		uni.showToast({
			title: str,
			icon: 'none',
			duration: duration
		})
	},

	// 计算字符串的长度（不含空格）
	getLengthIgnoringLeadingSpaces(jiandu_content) {
		// 去除开头的空格
		jiandu_content = jiandu_content.trimLeft();

		// 使用正则表达式将连续多个空格替换为一个空格
		jiandu_content = jiandu_content.replace(/\s+/g, ' ');

		// 返回处理后的字符串的长度
		return jiandu_content.length;
	},

}