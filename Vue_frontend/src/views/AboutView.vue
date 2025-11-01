<template>
 <div class="lrflex">
     <div class="nav">  </div>
     <div class="rContainer">
        <div class="nav-c"></div>
        <div class="container">
            <router-view></router-view>
        </div>
     </div>
    
 </div>
          
</template>
<script>
 
 export default {
        data(){
            return {
            
            }
        },
        methods:{
         
        },
        // 在Vue组件的mounted钩子中
mounted() {
         // 1. 获取所有需要观察的章节元素
         const sections = document.querySelectorAll('.content-section');
         
         // 2. 创建观察器
         this.observer = new IntersectionObserver(
            (entries) => {
               entries.forEach(entry => {
               if (entry.isIntersecting) {
                  // 3. 当元素进入视口时，更新导航状态
                  const activeId = entry.target.getAttribute('id');
                  this.activeNav = activeId; // 更新data中的activeNav
               }
               });
            },
            {
               threshold: 0.5, // 当50%元素进入视口时触发
               rootMargin: '0px 0px -50% 0px' // 底部提前50%视口高度触发
            }
            );
            // 4. 开始观察所有章节
            sections.forEach(section => {
               this.observer.observe(section);
            });
            },
            // 5. 组件销毁时断开观察
            beforeUnmount() {
            this.observer?.disconnect();
            }
        
    }

</script>
<style>
   .nav{
     background-color: aqua;
     height: 100vh;
     width:15vw;
   }
   .nav-c{
      background-color: rgb(173, 104, 1);
      width: 100%;
      height: 10%;
   }
   .container{
      background-color: rgb(235, 235, 241);
      width: 100%;
      height: 90%;
   }
   .lrflex{
      display: flex;
      gap:0;
   }
   .rContainer{
     height:100vh;
     width:85vw;
     position: relative;
   }
</style>




