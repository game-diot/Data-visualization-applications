export const BASE_URL  = 'https://dummyjson.com';
//可使用延迟参数模拟延迟  /？delay=0-5000
export const API = {
    test:{
        test:`${BASE_URL}/test`
    },
    //方形图片，后面可接 /width x height，获取指定大小图片
    image:{
        image:`${BASE_URL}/image`
    },
    auth:{
        login:`${BASE_URL}/auth/login`,
        personalInformation:`${BASE_URL}/auth/me`,
        refresh:`${BASE_URL}/auth/refresh`,
    },
    products:{
        products:"/products",
        product:(id)=>`/products/${id}`,
        categories:"/products/categories",
        categoryList:"/products/category-list",
        categoryProduct:(product)=>`/products/category/${product}`,
        addProduct:"/products/add",
    },
    carts:{
        carts:"/carts",
        cart:(id)=>`/carts/${id}`,
        userCart:(id)=>`/carts/user/${id}`,
        addCart:"/carts/add",
    },
    recipe:{
        recipes:"/recipes",
        recipe:(id)=>`/recipes/${id}`,
        recipesTags:"/recipes/tags",
        recipesTag:(id)=>`/recipes/tag/${id}`,
    },
}