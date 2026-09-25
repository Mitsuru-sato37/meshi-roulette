import type { Candidate, MoodTag, PriceBand } from "./types";

const g = (id: string, name: string, prices: PriceBand[], tags: MoodTag[]): Candidate => ({ id, name, kind: "genre", genreId: id, mapQuery: name, prices, tags });
export const GENRES: Candidate[] = [
  g("ramen", "ラーメン", ["under-1000", "1000-2000"], ["quick", "hearty", "solo-friendly", "late-night"]),
  g("donburi", "牛丼・丼もの", ["under-1000"], ["quick", "hearty", "solo-friendly", "takeout"]),
  g("teishoku", "定食", ["under-1000", "1000-2000"], ["hearty", "vegetables", "solo-friendly"]),
  g("noodles", "うどん・そば", ["under-1000", "1000-2000"], ["quick", "light", "solo-friendly"]),
  g("curry", "カレー", ["under-1000", "1000-2000"], ["quick", "hearty", "solo-friendly", "takeout"]),
  g("sushi", "寿司", ["1000-2000", "over-2000"], ["light", "group-friendly"]),
  g("yakiniku", "焼肉・しゃぶしゃぶ", ["1000-2000", "over-2000"], ["hearty", "group-friendly", "drinks"]),
  g("fried", "とんかつ・揚げ物", ["under-1000", "1000-2000"], ["hearty", "solo-friendly", "takeout"]),
  g("chinese", "中華", ["under-1000", "1000-2000"], ["quick", "hearty", "group-friendly"]),
  g("family", "ファミレス", ["under-1000", "1000-2000"], ["vegetables", "group-friendly", "late-night"]),
  g("burger", "ハンバーガー", ["under-1000", "1000-2000"], ["quick", "solo-friendly", "takeout"]),
  g("western", "ステーキ・洋食", ["1000-2000", "over-2000"], ["hearty", "group-friendly"]),
  g("italian", "パスタ・イタリアン", ["1000-2000", "over-2000"], ["group-friendly", "vegetables"]),
  g("pizza", "ピザ", ["1000-2000", "over-2000"], ["group-friendly", "takeout"]),
  g("cafe", "カフェ・軽食", ["under-1000", "1000-2000"], ["light", "morning", "solo-friendly"]),
  g("izakaya", "居酒屋", ["1000-2000", "over-2000"], ["drinks", "group-friendly", "late-night"]),
  g("regional", "地域料理", ["1000-2000", "over-2000"], ["group-friendly", "drinks"]),
];

const chainRows: [string, string, string][] = [
  ["yoshinoya","吉野家","donburi"],["sukiya","すき家","donburi"],["matsuya","松屋","donburi"],["nakau","なか卯","donburi"],
  ["ootoya","大戸屋","teishoku"],["yayoiken","やよい軒","teishoku"],["tenya","天丼てんや","donburi"],["matsunoya","松のや","fried"],["katsuya","かつや","fried"],
  ["marugame","丸亀製麺","noodles"],["hanamaru","はなまるうどん","noodles"],["fujisoba","名代富士そば","noodles"],["yudetaro","ゆで太郎","noodles"],
  ["cocoichi","CoCo壱番屋","curry"],["gogo-curry","ゴーゴーカレー","curry"],["hidakaya","日高屋","chinese"],["korakuen","幸楽苑","ramen"],["tenkaippin","天下一品","ramen"],["ippudo","一風堂","ramen"],["ichiran","一蘭","ramen"],["ringerhut","リンガーハット","chinese"],
  ["ohsho","餃子の王将","chinese"],["osaka-ohsho","大阪王将","chinese"],["bamiyan","バーミヤン","chinese"],
  ["sushiro","スシロー","sushi"],["kurasushi","くら寿司","sushi"],["hamazushi","はま寿司","sushi"],["kappasushi","かっぱ寿司","sushi"],["uobei","魚べい","sushi"],
  ["gyukaku","牛角","yakiniku"],["anrakutei","安楽亭","yakiniku"],["yakiniku-king","焼肉きんぐ","yakiniku"],["shabuyo","しゃぶ葉","yakiniku"],["onyasai","温野菜","yakiniku"],
  ["gusto","ガスト","family"],["jonathans","ジョナサン","family"],["dennys","デニーズ","family"],["royalhost","ロイヤルホスト","family"],["saizeriya","サイゼリヤ","family"],["cocos","ココス","family"],["joyfull","ジョイフル","family"],["bigboy","ビッグボーイ","western"],
  ["mcdonalds","マクドナルド","burger"],["mosburger","モスバーガー","burger"],["burgerking","バーガーキング","burger"],["lotteria","ロッテリア","burger"],["freshness","フレッシュネスバーガー","burger"],["kfc","ケンタッキーフライドチキン","burger"],["wendys-first-kitchen","ウェンディーズ・ファーストキッチン","burger"],
  ["goemon","洋麺屋五右衛門","italian"],["jollypasta","ジョリーパスタ","italian"],["kamakura-pasta","鎌倉パスタ","italian"],["capricciosa","カプリチョーザ","italian"],
  ["dominos","ドミノ・ピザ","pizza"],["pizzahut","ピザハット","pizza"],["pizza-la","ピザーラ","pizza"],
  ["komeda","コメダ珈琲店","cafe"],["doutor","ドトールコーヒー","cafe"],["starbucks","スターバックス","cafe"],["tullys","タリーズコーヒー","cafe"],["saintmarc-cafe","サンマルクカフェ","cafe"],
  ["torikizoku","鳥貴族","izakaya"],["kushikatsu-tanaka","串カツ田中","izakaya"],["isomaru","磯丸水産","izakaya"],
];

const defaults: Record<string, { prices: PriceBand[]; tags: MoodTag[] }> = {
  donburi:{prices:["under-1000"],tags:["quick","hearty","solo-friendly","takeout"]}, teishoku:{prices:["under-1000","1000-2000"],tags:["hearty","vegetables","solo-friendly"]}, fried:{prices:["under-1000","1000-2000"],tags:["hearty","solo-friendly","takeout"]}, noodles:{prices:["under-1000","1000-2000"],tags:["quick","light","solo-friendly"]}, curry:{prices:["under-1000","1000-2000"],tags:["quick","hearty","solo-friendly"]}, ramen:{prices:["under-1000","1000-2000"],tags:["quick","hearty","solo-friendly","late-night"]}, chinese:{prices:["under-1000","1000-2000"],tags:["quick","hearty","group-friendly"]}, sushi:{prices:["1000-2000","over-2000"],tags:["light","group-friendly"]}, yakiniku:{prices:["1000-2000","over-2000"],tags:["hearty","group-friendly","drinks"]}, family:{prices:["under-1000","1000-2000"],tags:["group-friendly","vegetables","late-night"]}, western:{prices:["1000-2000","over-2000"],tags:["hearty","group-friendly"]}, burger:{prices:["under-1000","1000-2000"],tags:["quick","solo-friendly","takeout"]}, italian:{prices:["1000-2000","over-2000"],tags:["group-friendly","vegetables"]}, pizza:{prices:["1000-2000","over-2000"],tags:["group-friendly","takeout"]}, cafe:{prices:["under-1000","1000-2000"],tags:["light","morning","solo-friendly"]}, izakaya:{prices:["1000-2000","over-2000"],tags:["drinks","group-friendly","late-night"]},
};
export const CHAINS: Candidate[] = chainRows.map(([id,name,genreId]) => ({ id, name, kind:"chain", genreId, mapQuery:name, ...defaults[genreId] }));
export const ALL_CANDIDATES = [...GENRES, ...CHAINS];
