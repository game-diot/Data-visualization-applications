<template>
  <div>
    <div class="files"  v-for="file in filesJson" :key="file.name">  
          {{file.name}} {{file.updateTime}} {{ file.size }}
    </div>
  </div>  
</template>
<style scoped>
/*   scoped 这些样式仅作用于当前组件 */
.files {
  display: flex;
  background-color: aquamarine;
}

</style>
<script>
  export default {
        data(){
            return {
             fileJson:[
               {
                    "name":"赵四","updateTime":"2025-09-23","size":"110mb"
               },
               {
                    "name":"赵五","updateTime":"2025-09-23","size":"110mb"
               },
                  {
                    "name":"赵六","updateTime":"2025-09-23","size":"110mb"
               },

             ]
               
             
            }
        },
        methods:{
         
        },
        
    }
</script>