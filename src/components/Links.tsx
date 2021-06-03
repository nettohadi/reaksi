import Reaksi, {useRouter} from "../reaksi";

export function Links(){
    const router = useRouter();
    return (
        <div style={{overflow:'hidden',height:'auto'}}>
            <ul style={{padding:0,display:'inline',listStyleType:'none',float:'left', width:'100%'}}>
                <li style={{display:'inline'}}><button onclick={() => router.push('/')}>Index</button></li>
                <li style={{display:'inline'}}><button onclick={() => router.push('/home/123')}>Home</button></li>
                <li style={{display:'inline'}}><button onclick={() => router.push('/about/123')}>About</button></li>
            </ul>
        </div>
    );
}