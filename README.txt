Bob's Farm Diary
================

日本語版: index.html
英語版: index_en.html

写真ライトボックス
--------------------

追加のライブラリやビルド作業は不要です。index.html と index_en.html が共通の
assets/style.css と assets/main.js を読み込むことで、両言語版で同じライト
ボックスが動作します。

使い方:

1. 写真のサムネイルをクリックすると、ページ内で元画像を拡大表示します。
2. 左右のボタン、またはキーボードの左右矢印キーで、同じ日記内の写真だけを
   移動します。
3. 閉じるボタン、写真外の暗い背景、または Esc キーで閉じます。
4. 閉じると、最初にクリックした写真へキーボードフォーカスが戻ります。

HTMLを再生成するときの条件:

* 各日記を class="entry" の要素にする。
* 写真リンクをその日記の内側に置き、class="photo-link" を付ける。
* 写真リンクの href は元画像、リンク内の img の src はサムネイル画像（現在は
  元画像と同じ）、alt は写真の説明にする。
* ページ末尾で assets/main.js、head 内で assets/style.css を読み込む。

例:

  <article class="entry">
    ...
    <div class="gallery">
      <a class="photo-link" href="assets/images/img_001.jpg"
         target="_blank" rel="noopener">
        <img src="assets/images/img_001.jpg" alt="Bob's Farm Diary 2026/04/11">
      </a>
    </div>
  </article>

JavaScriptが無効な場合やライトボックスを初期化できない場合も、href と
target="_blank" を残しているため、写真リンクから元画像を開けます。

ローカル確認
------------

`/workspace/hatake-diary` はCodexの作業環境内だけのパスです。自分のPCに
`workspace` フォルダを作成する必要はありません。

GitHub Desktopを利用している場合は、Bob's Farm Diaryのリポジトリを選択し、
メニューから次を選びます。

* Windows: Repository → Show in Explorer
* macOS: Repository → Show in Finder

ここで表示された、index.html が入っているフォルダが「リポジトリ直下」です。

Windowsでは、そのフォルダの何もない場所をShiftキーを押しながら右クリックし、
「ターミナルで開く」または「PowerShell ウィンドウをここで開く」を選びます。
macOSではFinderでフォルダを右クリックして「フォルダに新規ターミナル」を選ぶか、
ターミナルへフォルダをドラッグして移動します。

開いたターミナルで次を実行します。

  python3 -m http.server 8000

Windowsで `python3` が見つからない場合は、代わりに次を実行します。

  py -m http.server 8000

`Serving HTTP on ... port 8000` と表示されたら、ターミナルは閉じずに、そのまま
ブラウザで次のURLを開きます。

日本語版:
  http://localhost:8000/index.html

英語版:
  http://localhost:8000/index_en.html

終了するときはターミナルに戻り、Ctrl+Cを押します。

Python自体が見つからない場合は、簡易確認としてindex.htmlをダブルクリックして
開くこともできます。このサイトは静的ファイルだけで構成されているため、通常は
ライトボックスも動作します。ただし、公開時に近い条件で確認するには上記のWeb
サーバーを使う方法を推奨します。

公開手順
--------

GitHub Pages用リポジトリへファイルをアップロード／上書きし、内容を確認して
からコミット、プッシュしてください。
