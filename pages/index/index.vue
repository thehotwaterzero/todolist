<template>
	<view class="container">
		<view class="head">
			<view class="header-number">
				<view class="complete">{{complete_num}}</view>
				<view class="sum">/ {{sum}}</view>
			</view>
			
			<view class="header-bar">
				<progress :percent="complete_bar" stroke-width="10" activeColor="rgb(102,147,116)" backgroundColor="rgb(232,243,237)"/>
			</view>
		</view>
		
		<view class="content">
			<view v-if="list.length == 0" class="default_content">
				<view>快来写下</view>
				<view>今天的计划吧</view>
			</view>
			
			<view v-else class="todo_content">
				<hr />
				<view class="todo_list" v-for="(item,index) in list" :key="index">
					<view class="list">
						<view class="li">{{item}}</view>
						<view class="check">
							<checkbox @click="checking"/>
						</view>
					</view>
					<hr />
				</view>
			</view>
		</view>
		
		<view class="bottom">
			<view class="input"><input @input="oninput" type="text" placeholder="请输入内容..." v-model="input_text"/></view>
			<view class="button">
				<image src="@/static/tabbar/clear.png" mode="widthFix" class="clear" @click="clear" />
				<text class="confirm" @click="confirm">确认</text>
			</view>
		</view>
	</view>
</template>

<script>
import input from '../../uni_modules/uview-ui/libs/config/props/input';
	export default {
		data() {
			return {
				checked: [],
				list: [],
				input_text: '',
				add_text: '',
				complete_num: 0,
				sum: 0,
				complete_bar: 0
			}
		},
		
		onLoad() {},
		
		computed: {
			
		},
		
		methods: {
			oninput(e){
				this.input_text = e.detail.value
				// console.log(this.input_text)
			},
			
			clear(e) {
				this.input_text = ''
			},
			
			confirm(e) {
				if(this.input_text.length!==0){
					this.sum = this.list.push(this.input_text)
					// console.log(this.list)
					// console.log(this.sum)
					this.input_text = ''
					this.checked.push(0)
					// console.log(this.checked)
					if(this.sum==0){
						this.complete_bar = 0
					}
					else{
						this.complete_bar = (this.complete_num / this.sum) * 100
						// console.log(this.complete_bar)
					}
				}
			},
			
			checking() {
				this.complete_num += 1
				if(this.sum==0){
					this.complete_bar = 0
				}
				else{
					this.complete_bar = (this.complete_num / this.sum) * 100
					// console.log(this.complete_bar)
				}
			}
		}
	}
</script>

<style lang="scss">
	*{
		box-sizing: border-box;
		font-family: dingding;
	}
	
	.container{
		display: flex;
		flex-direction: column;
		height: 1520rpx;
	}
	
	hr{
		color: rgb(249,250,251);
	}
	
	// *顶部
	.head{
		display: flex;
		flex-direction: column;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
	}
	
	// **数字
	.header-number{
		display: flex;
		align-items: flex-end;
		margin: 15px;
	}
	
	.sum{
		color: $uni-text-color-grey;
		font-size: 25px;
	}
	
	.complete{
		margin-right: 8px;
		font-size: 40px;
	}
	
	// **进度条
	progress{
		margin: 8px;
	}
	
	/deep/ .uni-progress-bar{
		border-radius: 20px;
	}
		
	/deep/ .uni-progress-inner-bar{  
		border-radius: 10px;
	}

	// *todolist
	.content{
		margin-top: 120px;
	}
	
	// **底部
	.bottom{
		display: flex;
		align-items: center;
		position: fixed;
		bottom: 0;
		width: 650rpx;
		height: 50px;
		margin: 15px;
		border-radius: 5px;
		box-shadow: 0 0 5px -2px rgba(0,0,0,5);
		overflow: hidden;
		
		
		// 清除按钮
		.clear{
			max-width: 50rpx;
		}
		
		// 确认按钮
		.confirm{
			margin-left: 20rpx;
			background-color: white;
			font-size: 45rpx;
			color: $uni-text-color-grey;
		}
		
		// 按钮
		.button{
			display: flex;
			align-items: center;
			justify-content: flex-end;
			margin-left: 25rpx;
		}
		
		// 输入框
		.input{
			margin: 10px;
			padding: 0;
		}
	}


	// *中间
	.default_content{
		position: relative;
		top: 300rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		font-size: 70rpx;
		color: $uni-text-color-grey;
	}
	
	.todo_content{
		overflow: scroll;
		height: 920rpx;
		font-size: 50rpx;
		margin: 0 30rpx;
		
		.list{
			display: flex;
			justify-content: space-between;
			align-items: center;
			min-width: 650rpx;
			max-width: 650rpx;
			color: $uni-text-color-grey;
			
			.li{
				display: flex;
				align-items: center;
				height: 100rpx;
			}
			
			.check{
				max-width: 50rpx;
			}
		}
	}
</style>
