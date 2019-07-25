# Neighborhood-Based Collaborative Filtering

## User-user Collaborative Filtering

- Input data, each row is `[user_id, item_id, rating]`

```
const ratings = [
	[0, 0, 5],
	[0, 1, 4],
	[0, 3, 2],
	[0, 4, 2],
	
	[1, 0, 5],
	[1, 2, 4],
	[1, 3, 2],
	[1, 4, 0],
	
	[2, 0, 2],
	[2, 2, 1],
	[2, 3, 3],
	[2, 4, 4],
	
	[3, 0, 0],
	[3, 1, 0],
	[3, 3, 4],
	
	[4, 0, 1],
	[4, 3, 4],
	
	[5, 1, 2],
	[5, 2, 1],
	
	[6, 2, 1],
	[6, 3, 4],
	[6, 4, 5],
];
```

- Build input matrix

```
const originalMatrix = [];
for(let row of ratings)
{
	const u = row[0];
	const i = row[1];
	const rating = row[2];
	
	originalMatrix[i] = originalMatrix[i] || [null, null, null, null, null, null, null];
	originalMatrix[i][u] = rating;
}
```

```
┌─────────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│ (index) │  0   │  1   │  2   │  3   │  4   │  5   │  6   │
├─────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│    0    │  5   │  5   │  2   │  0   │  1   │ null │ null │
│    1    │  4   │ null │ null │  0   │ null │  2   │ null │
│    2    │ null │  4   │  1   │ null │ null │  1   │  1   │
│    3    │  2   │  2   │  3   │  4   │  4   │ null │  4   │
│    4    │  2   │  0   │  4   │ null │ null │ null │  5   │
└─────────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘
```

- Normalize matrix

```
const normalizedMatrix = [];
const normalizes = [];
for(let u = 0; u < originalMatrix[0].length; u ++)
{
	let total = 0;
	let sum = 0;
	for(let i = 0; i < originalMatrix.length; i ++)
	{
		if(originalMatrix[i][u] !== null)
		{
			total ++;
			sum += originalMatrix[i][u];
		}
	}
	
	const normalize = sum/total;
	normalizes[u] = normalize;
	
	for(let i = 0; i < originalMatrix.length; i ++)
	{
		normalizedMatrix[i] = normalizedMatrix[i] || [];
		if(originalMatrix[i][u] !== null)
		{
			normalizedMatrix[i][u] = originalMatrix[i][u] - normalize;
		} else {
			normalizedMatrix[i][u] = 0;
		}
	}
}

```

```
┌─────────┬───────┬───────┬──────┬─────────────────────┬──────┬──────┬─────────────────────┐
│ (index) │   0   │   1   │  2   │          3          │  4   │  5   │          6          │
├─────────┼───────┼───────┼──────┼─────────────────────┼──────┼──────┼─────────────────────┤
│    0    │ 1.75  │ 2.25  │ -0.5 │ -1.3333333333333333 │ -1.5 │  0   │          0          │
│    1    │ 0.75  │   0   │  0   │ -1.3333333333333333 │  0   │ 0.5  │          0          │
│    2    │   0   │ 1.25  │ -1.5 │          0          │  0   │ -0.5 │ -2.3333333333333335 │
│    3    │ -1.25 │ -0.75 │ 0.5  │  2.666666666666667  │ 1.5  │  0   │ 0.6666666666666665  │
│    4    │ -1.25 │ -2.75 │ 1.5  │          0          │  0   │  0   │ 1.6666666666666665  │
└─────────┴───────┴───────┴──────┴─────────────────────┴──────┴──────┴─────────────────────┘
```

- Calculate similarity matrix

```
const similarityMatrix = [];
for(let ua = 0; ua < normalizedMatrix[0].length; ua ++)
{
	const uav = [];
	for(let i = 0; i < normalizedMatrix.length; i ++)
	{
		uav[i] = normalizedMatrix[i][ua];
	}
	
	for(let ub = 0; ub < normalizedMatrix[0].length; ub ++)
	{
		const ubv = [];
		for(let i = 0; i < normalizedMatrix.length; i ++)
		{
			ubv[i] = normalizedMatrix[i][ub];
		}
		
		similarityMatrix[ua] = similarityMatrix[ua] || [];
		similarityMatrix[ua][ub] = similarity(uav, ubv);
	}
}

```

```
┌─────────┬─────────────────────┬──────────────────────┬─────────────────────┬─────────────────────┬─────────────────────┬──────────────────────┬─────────────────────┐
│ (index) │          0          │          1           │          2          │          3          │          4          │          5           │          6          │
├─────────┼─────────────────────┼──────────────────────┼─────────────────────┼─────────────────────┼─────────────────────┼──────────────────────┼─────────────────────┤
│    0    │          1          │  0.8330743477031354  │ -0.5809475019311124 │ -0.7856742013183861 │ -0.816496580927726  │ 0.20412414523193148  │ -0.3813369294353577 │
│    1    │ 0.8330743477031354  │  1.0000000000000002  │ -0.8733337646093731 │ -0.3986205025895504 │ -0.5523447707389941 │ -0.23014365447458085 │ -0.7075675872186338 │
│    2    │ -0.5809475019311124 │ -0.8733337646093731  │ 0.9999999999999998  │ 0.27386127875258304 │ 0.31622776601683794 │  0.4743416490252569  │  0.962102398729483  │
│    3    │ -0.7856742013183861 │ -0.3986205025895504  │ 0.27386127875258304 │ 1.0000000000000002  │ 0.8660254037844387  │ -0.2886751345948128  │ 0.1849000654084097  │
│    4    │ -0.816496580927726  │ -0.5523447707389941  │ 0.31622776601683794 │ 0.8660254037844387  │ 1.0000000000000002  │          0           │ 0.1601281538050871  │
│    5    │ 0.20412414523193148 │ -0.23014365447458085 │ 0.4743416490252569  │ -0.2886751345948128 │          0          │  0.9999999999999998  │  0.560448538317805  │
│    6    │ -0.3813369294353577 │ -0.7075675872186338  │  0.962102398729483  │ 0.1849000654084097  │ 0.1601281538050871  │  0.560448538317805   │          1          │
└─────────┴─────────────────────┴──────────────────────┴─────────────────────┴─────────────────────┴─────────────────────┴──────────────────────┴─────────────────────┘
```

- Predict missing rating

```
const k = 2;
const predictNormalizedMatrix = [...normalizedMatrix];
for(let i = 0; i < normalizedMatrix.length; i ++)
{
	for(let u = 0; u < normalizedMatrix[i].length; u ++)
	{
		if(normalizedMatrix[i][u] === 0)
		{
//			console.log('--------------------------')
//			console.log('missing u' + u + '.i' + i)
			const similarities = {};
			for(let uv = 0; uv < normalizedMatrix[i].length; uv ++)
			{
				if(normalizedMatrix[i][uv] !== 0)
				{
//					console.log('had u' + u + ' vs u' + uv + ' = ' + similarityMatrix[u][uv])
					
					similarities[u + '.' + uv] = similarityMatrix[u][uv];
				}
			}
			
//			console.log('similarities', similarities)
			
			const nearSimilarities = {};
			let currentTotalSimilarities = 0;
			while (currentTotalSimilarities < k)
			{
				let maxKey = Object.keys(similarities)[0];
				let max = similarities[maxKey];
				
//				console.log('init max = ' + maxKey + ' => ' + max)
				
				for(let vs in similarities)
				{
//					console.log('-> checking ' + vs + ' => ' + similarities[vs], vs !== maxKey, Object.keys(nearSimilarities).indexOf(vs) === -1, similarities[vs] > max)
					if(vs !== maxKey && Object.keys(nearSimilarities).indexOf(vs) === -1 && similarities[vs] > max)
					{
//						console.log('--> good')
						
						maxKey = vs;
						max = similarities[maxKey];
					}
				}
				
				nearSimilarities[maxKey] = max;
				currentTotalSimilarities++;
				delete similarities[maxKey];
			}
			
//			console.log(nearSimilarities)
			const normalizedRatings = {};
			for(let vs in nearSimilarities)
			{
				const u = vs.split('.')[1];
				normalizedRatings[nearSimilarities[vs]] = normalizedMatrix[i][u];
			}
			
			let total = 0;
			let sum = 0;
			for(let similarity in normalizedRatings)
			{
				const rating = normalizedRatings[similarity];
				total += Math.abs(similarity);
				sum += similarity * rating;
			}
			
			const normalizedPredictRating = sum/total;
			predictNormalizedMatrix[i][u] = normalizedPredictRating;
		}
	}
}

```

```
┌─────────┬────────────────────┬────────────────────┬──────────────────────┬─────────────────────┬─────────────────────┬─────────────────────┬─────────────────────┐
│ (index) │         0          │         1          │          2           │          3          │          4          │          5          │          6          │
├─────────┼────────────────────┼────────────────────┼──────────────────────┼─────────────────────┼─────────────────────┼─────────────────────┼─────────────────────┤
│    0    │        1.75        │        2.25        │         -0.5         │ -1.3333333333333333 │        -1.5         │ 0.17693807213182103 │ -0.250820190099053  │
│    1    │        0.75        │ 0.4794256046229542 │ -0.17104657360480416 │ -1.3333333333333333 │ -1.0224461605277972 │         0.5         │ 0.07596458521352518 │
│    2    │ 0.9055941253394749 │        1.25        │         -1.5         │ -1.8358682892564486 │ -1.7460306119294202 │        -0.5         │ -2.3333333333333335 │
│    3    │       -1.25        │       -0.75        │         0.5          │  2.666666666666667  │         1.5         │  0.590267660886377  │ 0.6666666666666665  │
│    4    │       -1.25        │       -2.75        │         1.5          │ 1.5671736578512896  │ 1.5492061223858842  │  1.590267660886377  │ 1.6666666666666665  │
└─────────┴────────────────────┴────────────────────┴──────────────────────┴─────────────────────┴─────────────────────┴─────────────────────┴─────────────────────┘
```

- Final result

```
const predictMatrix = [...predictNormalizedMatrix];
for(let i = 0; i < predictNormalizedMatrix.length; i ++)
{
	for(let u = 0; u < predictNormalizedMatrix[i].length; u ++)
	{
		predictMatrix[i][u] += normalizes[u];
	}
}
```

```
┌─────────┬───────────────────┬────────────────────┬───────────────────┬─────────────────────┬────────────────────┬───────────────────┬────────────────────┐
│ (index) │         0         │         1          │         2         │          3          │         4          │         5         │         6          │
├─────────┼───────────────────┼────────────────────┼───────────────────┼─────────────────────┼────────────────────┼───────────────────┼────────────────────┤
│    0    │         5         │         5          │         2         │          0          │         1          │ 1.676938072131821 │ 3.0825131432342805 │
│    1    │         4         │ 3.2294256046229544 │ 2.328953426395196 │          0          │ 1.4775538394722028 │         2         │ 3.4092979185468586 │
│    2    │ 4.155594125339475 │         4          │         1         │ -0.5025349559231154 │ 0.7539693880705798 │         1         │         1          │
│    3    │         2         │         2          │         3         │          4          │         4          │ 2.090267660886377 │         4          │
│    4    │         2         │         0          │         4         │  2.900506991184623  │ 4.049206122385884  │ 3.090267660886377 │         5          │
└─────────┴───────────────────┴────────────────────┴───────────────────┴─────────────────────┴────────────────────┴───────────────────┴────────────────────┘
```