//Time Complexity = O(n^log23) or O(n^2)
//Recurrence relation = 3T(n/2) + nlogn
//UID - 24BCS10700
#include <bits/stdc++.h>
using namespace std;
long long operations = 0;
int maxDepth = 0;
void complexRec(int n, int depth) {
    maxDepth = max(maxDepth, depth);
    if (n <= 2) {
        operations++;
        return;
    }
    int p = n;
    while (p > 0) {
        vector<int> temp(n);
        operations += n;
        for (int i = 0; i < n; i++) {
            temp[i] = i ^ p;
            operations++;
        }
        p >>= 1;
        operations++;
    }
    vector<int> small(n);
    for (int i = 0; i < n; i++) {
        small[i] = i * i;
        operations++;
    }
    reverse(small.begin(), small.end());
    operations += n;
    complexRec(n / 2, depth + 1);
    complexRec(n / 2, depth + 1);
    complexRec(n / 2, depth + 1);
}
int main() {
    vector<int> testSizes = {8, 16, 32, 64, 128};
    for (int n : testSizes) {
        operations = 0;
        maxDepth = 0;

        auto start = chrono::high_resolution_clock::now();
        complexRec(n, 1);
        auto end = chrono::high_resolution_clock::now();
        auto duration = chrono::duration_cast<chrono::milliseconds>(end - start);

        cout << "n = " << n << endl;
        cout << "no of Operations = " << operations << endl;
        cout << "Depth = " << maxDepth << endl;
        cout << "Time int mili = " << duration.count() << endl;
    }
}