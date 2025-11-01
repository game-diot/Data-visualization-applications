<template>
<div class="mainContainer">
    <div class="loginAd"></div>
    <div class="loginArea" >
      <div class="nav">
        <div class="btnContainer">
          <div class="navBtn" @click="TopicChange">切换主题</div>
          <div class="navBtn">Eng/中文</div>
          <div class="navBtn"></div>
        </div>
      </div>
        <div class="loginContainer">
         <!--登录-----------------------------------------------------------------> 
        
         <div 
            class="CenterBox"
             > 
            <h2 class="welcome">请您{{ operation }}</h2>
            <div v-if="showLogin" class="loginForm">
              <el-form
                  :model="LoginForm"
                  :rules="LoginRules"
                  ref="loginFormRef"
               >
                 <el-form-item prop="account" >
                  <el-input
                   v-model="LoginForm.account"
                   placeholder="请输入账号"
                  />
                 </el-form-item>
                 <el-form-item prop="pwd">
                  <el-input
                   v-model="LoginForm.password"
                   type="password"
                   placeholder="请输入密码"
                  />
                 </el-form-item> 
               </el-form>
               <el-button
                    type="primary"
                    class="loginBtn"
                    @click="handleLogin"
                  >
                    <p style="color: white;">登录</p>
                </el-button> 
           </div>
       <!--注册------------------------------------------------------------------------------------------->
               <div  v-if="showRegister" >
                <div class="input-group">
                  <el-input
                    type="text"
                    v-model="regEmail"
                    placeholder="请输入邮箱账号"
                  />
                  <el-input
                    type="password"
                    v-model="regPassword"
                    @input="regPasswordVerify"
                    placeholder="请输入密码"
                  />
                  <button @click="showPassword = !showPassword">
                    {{ showPassword ? '👁️' : '' }}
                  </button>
                </div>
                <div class="strength-meter">
                  强度: {{ strengthLevel }}%
                  <progress :value="strengthLevel" max="100"></progress>
                </div> 
                  <ul class="rules-list">
                    <li 
                      v-for="rule in rules"
                      :key="rule.id"
                      :class="{ 'passed': rule.valid }"
                    >
                      {{ rule.valid ? '✓' : '✗' }} {{ rule.text }}
                    </li>
                  </ul>

                 <el-input
                    :type="showPassword ? 'text' : 'password'"
                    v-model="rePassword"
                    @input="passwordVerify"
                    placeholder="请再次输入密码"
                  />
                  <p v-if="rePasswordWrong" style="color: red;">两次输入密码不一致</p>
                  
                    <el-button
                       type="default"
                       @click="canRegist ? handleRegist() : regAlert()"   
                    >
                     注册
                    </el-button>
                 
               </div>
                    <div 
                  @click="openRegist" 
              >
    <!-------------------------------------------------------------------------------------------------------------->
                
               </div>
                 <a href="#" style=" margin-bottom: 20px" @click.prevent=" openRegist">点击注册</a>
           </div> 
                 
              </div>



            
        </div>
    </div>


          
</template>
<script>


 
 export default {
        data(){
            return {
             operation:'登录',
              LoginForm:{
                account:'',
                password:'',
              },
              exchangeLR:'未注册？点击注册',
              RegistForm:{
                account:'',
                password:'',
                Secpassword:'',
              },
              LoginRules:{
                account:[{required:true, message:'请输入账号', trigger:'blur'}],
                password:[{required:true, message:'请输入密码', trigger:'blur'}]
              },
              RegisterRules:{

              },
                showLogin:true,
                showRegister:false,
                regEmail:'',
                //注册验证
                regPassword:'',
                rePassword: '',
                showPassword: false,
                rules: [
                  { id: 'length', text: '至少8个字符', valid: false, validate: val => val.length >= 8 },
                  { id: 'uppercase', text: '包含大写字母', valid: false, validate: val => /[A-Z]/.test(val) },
                  { id: 'lowercase', text: '包含小写字母', valid: false, validate: val => /[a-z]/.test(val) },
                  { id: 'number', text: '包含数字', valid: false, validate: val => /[0-9]/.test(val) },
                  { id: 'special', text: '包含特殊字符', valid: false, validate: val => /[!@#$%^&*?]/.test(val) }
                ],
             

            }
        },
        computed:{
          //注册密码强度计算
             strengthLevel(){ 
              const passed =this.rules.filter(r => r.valid).length
              return Math.round((passed / this.rules.length) * 100)
             },
          //注册表单前端过滤
            canRegist(){
              return(
                this.regEmail && 
                this.regPassword &&
                this.regPassword == this.rePassword &&
                this.rules.every(rule => rule.valid)        //js原生方法  判断数组每一项是否符合条件 一般性能优化良好
              );
            },
             rePasswordWrong() {
                return this.rePassword && 
                this.regPassword !== this.rePassword; 
             },
        },
    
        methods:{
         TopicChange(){
                const root = document.documentElement;
                root.getAttribute('data-theme') == 'dark' 
                ? root.removeAttribute('data-theme') 
                : root.setAttribute('data-theme', 'dark'

         )},
        openRegist(){
                this. showRegister = !this. showRegister
                this.showLogin = !this.showLogin
                this.operation = this.showRegister ? '注册' : '登录'
                this.exchangeLR = !this.showRegister ? '未登录？点击注册' : '返回登录'

         

        },

        //提交模块 
         handleLogin(){
                //  let json ={ ...this.LoginForm}
                //  let _this = this;
                //  _this.axios.post(`${_this.baseurl}/user/userLogin`,json, {
                //     headers:{
                //        "Content-Type":"application/json",
                //        "Authorization":''0

                //     }
                //  }).then(function(res){
                //    if(res.data.code == 1){
                //       localStorage.setItem('token',res.data.token);
                //       console.log(localStorage.getItem.token)//调试用
                //       setTimeout(() =>{_this.$router.replace({
                //          path:'/index'
                //       })},100)
                //    }else{
                //       alert(res.data.msg);
                //    }
                //  })
         },
         regAlert(){
                  alert('请正确输入')
                  },
       
        handleRegist(){
              
          
                //  let json ={ ...this.LoginForm}
                //  let _this = this;
                //  _this.axios.post(`${_this.baseurl}/user/userRegist`,json, {
                //     headers:{
                //        "Content-Type":"application/json",
                //        "Authorization":''
                //     }
                //  }).then(function(res){
                //    if(res.data.code == 1){
                //       localStorage.setItem('token',res.data.token);
                //       console.log(localStorage.getItem.token)//调试用
                //       setTimeout(() =>{_this.$router.replace({
                //          path:'/index'
                //       })},100)
                //    }else{
                //       alert(res.data.msg);
                //    }
                //  })  
         }, 
          regPasswordVerify(){
            this.rules.forEach(rule => {
               this.$set(rule, 'valid', rule.validate(this.regPassword))
                })
             
            //这里不能直接用  this.rePassword  &&  (this.regPassword != this.rePassword) ? true : false
            // 因为vue2框架异步更新会导致每次input检测时间内不能及时更新this.repassword，导致跳过提示弹出检测 && 左侧为false
            
          }
         
            }
         }
        
       

            
          

</script>

<style>

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box; 
}
:root{ --ad:aqua;

       --nav:rgb(247,247,247); 
       --navBorder:solid black 1px;
       
       --loginWelcome:rgb(183, 179, 179);
       --loginContainer:rgb(200, 200, 200); 
       --loginBox:rgba(255,255,255,0.05); 

       --navBtn:rgb(133, 174, 174);
       --navbtnBorder:#333;
      }



[data-theme='dark'] { 
     --ad:gray;
       --nav:rgb(247,247,247); 
       --navBorder:solid white 1px;
      
       --loginContainer:rgba(212, 210, 210, 0.2); 
       --loginBox:rgb(181, 180, 180); 

       --navBtn:rgb(64, 66, 66);
       --navbtnBorder:#cfcccc;
 }

 
  .mainContainer{
    display: flex;
    position: absolute;
    height: 100vh;
    width:100vw;
  }
  .loginAd{
    height: 100%;
    width:15%;
   
    background-color:    var(--ad);/*  aque*/ 
  }
  .loginArea{
    height:100%;
    width:85%;
  }
  
  
.nav{
    width: 100%;
    height: 10%;
    background-color:var(--nav); /*rgb(247, 247, 247);*/
    display: flex;
    justify-content: end;
    gap: 5px;
    border-bottom:  var(--navBorder) /*solid black 1px;*/
  }
  .btnContainer{
    display: flex;
    gap:5px;
    margin-right: 10px;
  }
  .loginContainer{
    width: 100%;
    height: 90%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-image:url('../images/loginImg.jpg');
    background-repeat: no-repeat;
    background-size: cover;
    background-color:var(--loginContainer) /* rgb(200, 200, 200);*/
  }




  .CenterBox{
    background-color:var(--loginBox); /*rgba(255, 255, 255);*/
 
    gap:10px;
    height:400px;
    width:350px;
    padding: 20px;
    border-radius: 2px;
    justify-content: center ;
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);
    /* align-items: center;
    justify-content: center; */
  }
  .loginForm{
    margin-top: 50px;
  }
  .welcome{
      
    color:var(--loginWelcome) ;
  }
  .loginBtn{
    width: 99%;
    position: relative;
    margin-top: 50px;
  }
  /* .strength-meter{
     
   
  } */
 
  .roles-list{
    list-style: none;
     padding: 0;
  }

  .navBtn{
    height:100%;
    width:80px;
    position:relative;
    background-color: var(--navBtn);   /* rgb(133, 174, 174);*/
  }
  .navBtn::after{
    content: '';
    position: absolute;
    top:50%;
    right: 0;
    transform:translateY(-50%);
    width:2px;
    height:60px;
    background:var(--navBtnBorder);  /*#333 ;*/
  }
  
</style>




