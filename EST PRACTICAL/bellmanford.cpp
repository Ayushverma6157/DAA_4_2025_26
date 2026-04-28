#include <bits/stdc++.h>
using namespace std;
struct Edge
{
    int a,b,w;
};
int main()
{
    int n,m,s;
    cin>>n>>m>>s;
    vector<Edge> e(m);
    for(int i=0;i<m;i++)
        cin>>e[i].a>>e[i].b>>e[i].w;

    vector<int> d(n,1e9);
    d[s]=0;

    for(int i=1;i<n;i++)
    {
        for(int j=0;j<m;j++)
        {
            if(d[e[j].a]!=1e9 && d[e[j].a]+e[j].w<d[e[j].b])
                d[e[j].b]=d[e[j].a]+e[j].w;
        }
    }
    for(int i=0;i<n;i++)
        cout<<d[i]<<" ";

    return 0;
}