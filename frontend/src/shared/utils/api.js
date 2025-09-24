export async function fetcher(url,method='GET',body=null,header={}){
    try{
        const options={
            method,
            headers:{
                "Content-Type": "application/json",
                ...header
            },
        };
        if(body){
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url,options);

        if(!response.ok){
            throw new Error(`请求失败：${response.status} ${response.statusText}`);
        }
        return await response.json();
    }
    catch(err){
        console.error(`fetch error:${err.message}`);
        throw err;
    }
}