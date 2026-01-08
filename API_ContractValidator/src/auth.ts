export function authenticate(headers: Record<string, string>){
    const auth_header= headers['x-mcp-auth'];
    if(!auth_header?.startsWith('Bearer ')){
        throw new Error("Missing authentication token");
    }
    const key=auth_header.replace("Bearer ", "");
    if(key!== "mcp_demo_key"){
        throw new Error("Invalid API key ")
    }

}