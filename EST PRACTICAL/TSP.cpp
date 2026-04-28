#include <bits/stdc++.h>
using namespace std;
int n;
int d[16][16];
int dp[16][1<<16];
int f(int u,int m)
{
    if(m==(1<<n)-1)
        return d[u][0];

    if(dp[u][m]!=-1)
        return dp[u][m];

    int ans=1e9;
    for(int v=0;v<n;v++)
    {
        if((m&(1<<v))==0)
            ans=min(ans,d[u][v]+f(v,m|(1<<v)));
    }
    return dp[u][m]=ans;
}
int main()
{
    cin>>n;
    for(int i=0;i<n;i++)
        for(int j=0;j<n;j++)
            cin>>d[i][j];
    memset(dp,-1,sizeof(dp));
    cout<<f(0,1);
    return 0;
}