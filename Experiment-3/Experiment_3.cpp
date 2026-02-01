#include <iostream>
#include <unordered_map>
using namespace std;

int main() {
    int n;
    cin >> n;

    unordered_map<int,int> mp;
    int sum = 0, maxLen = 0;
    mp[0] = -1;

    for(int i = 0; i < n; i++) {
        char ch;
        cin >> ch;

        if(ch == 'P')
            sum++;
        else
            sum--;

        if(mp.find(sum) != mp.end())
            maxLen = max(maxLen, i - mp[sum]);
        else
            mp[sum] = i;
    }

    cout << maxLen;
    return 0;
}