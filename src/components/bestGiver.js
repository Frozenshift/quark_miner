export let bestGiver = { address: "", coins: 0 };

export async function updateBestGivers(givers) {
  const giver = givers.data[Math.floor(Math.random() * givers.data.length)];
  if (giver) {
    bestGiver = {
      address: giver.address,
      coins: giver.reward,
    };
  }
}
