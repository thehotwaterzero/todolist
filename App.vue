<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
	@import "@/uni_modules/uview-ui/index.scss";
	
	/* 引入 公共 css 库 */
	@import "static/css/common.css";
	@import "static/css/free.css";
	
	page {
		background-color: #fff;
	}
	
	uni-modal {
		z-index: 19999 !important;
	}
	
	@font-face {
		font-family: dingding;
		src: url('@/static/font/DingTalk_JinBuTi_Regular.ttf');
	}
	
	@font-face {
		font-family: handmade;
		src: url('@/static/font/ali_dali.ttf');
	}
	
	@font-face {
		font-family: ali_puhui;
		src: url('/static/font/ali_puhui.ttf');
	}
	
	@font-face {
		font-family: ali_puhui_bold;
		src: url('/static/font/ali_puhui_bold.ttf');
	}
</style>
