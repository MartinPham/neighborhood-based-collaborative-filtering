// https://stackoverflow.com/questions/28771117/is-this-the-right-approach-to-calculate-cosine-similarity
function dotproduct(a, b) {
	var n = 0,
		lim = Math.min(a.length, b.length);
	for (var i = 0; i < lim; i++) n += a[i] * b[i];
	return n;
}

function norm2(a) {
	var sumsqr = 0;
	for (var i = 0; i < a.length; i++) sumsqr += a[i] * a[i];
	return Math.sqrt(sumsqr);
}

function similarity(x, y) {
	xnorm = norm2(x);
	if (!xnorm) return 0;
	ynorm = norm2(y);
	if (!ynorm) return 0;
	return dotproduct(x, y) / (xnorm * ynorm);
}



/*
const u0 = {
	i0: 5,
	i1: 4,
	i3: 2,
	i4: 2,
};
const u1 = {
	i0: 5,
	i2: 4,
	i3: 2,
	i4: 0,
};
const u2 = {
	i0: 2,
	i2: 1,
	i3: 3,
	i4: 4,
};
const u3 = {
	i0: 0,
	i1: 0,
	i3: 4,
};
const u4 = {
	i0: 1,
	i3: 4,
};
const u5 = {
	i1: 2,
	i2: 1,
};
const u6 = {
	i2: 1,
	i3: 4,
	i4: 5,
};

const originalMatrix = [];
for(let i = 0; i <= 4; i ++)
{
	for(let u = 0; u <= 6; u ++)
	{
		originalMatrix[i] = originalMatrix[i] || [];
		let rating = eval('u' + u + '.i' + i);
		
		
		if(typeof rating === 'undefined')
		{
			rating = null;
		}
		
		originalMatrix[i][u] = rating;
	}
}
*/

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

const originalMatrix = [];
for(let row of ratings)
{
	const u = row[0];
	const i = row[1];
	const rating = row[2];
	
	originalMatrix[i] = originalMatrix[i] || [null, null, null, null, null, null, null];
	originalMatrix[i][u] = rating;
}

console.table(originalMatrix);

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

//console.log(normalizes);
console.table(normalizedMatrix);

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

console.table(similarityMatrix);

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

console.table(predictNormalizedMatrix);

const predictMatrix = [...predictNormalizedMatrix];
for(let i = 0; i < predictNormalizedMatrix.length; i ++)
{
	for(let u = 0; u < predictNormalizedMatrix[i].length; u ++)
	{
		predictMatrix[i][u] += normalizes[u];
	}
}

console.table(predictMatrix);