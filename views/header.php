<!DOCTYPE html>

<html>

    <head>
        <!-- viewport to make things more responsive -->
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <!-- http://getbootstrap.com/ -->
        <link href="css/bootstrap.min.css" rel="stylesheet"/>

        <link href="css/styles.css" rel="stylesheet"/>

        <?php if (isset($title)): ?>
            <title>DFS: <?= htmlspecialchars($title) ?></title>
        <?php else: ?>
            <title>DFS</title>
        <?php endif ?>

        <!-- https://jquery.com/ -->
        <script src="js/jquery-1.11.3.min.js"></script>

        <!-- http://getbootstrap.com/ -->
        <script src="js/bootstrap.min.js"></script>
        <!-- https://github.com/evanplaice/jquery-csv/ -->
        <script src="js/jquery.csv.min.js"></script>
        <script src="js/mlb_optimizer.js"></script>
        <script src="js/scripts.js"></script>
        <script src="js/js_pagination.js"></script>

    </head>

    <body>
        <div class = "container">
            <div id="top">
                <div class = "custom-navbar container">
                    <div class = "logo nav">
                        <a href="index.php"><img alt="DFS" src="img/logo.png"/></a>
                    </div>
                    <div class = "optimizer nav">
                        <a href="optimizer.php">Optimizer</a>
                    </div>
                    <div class = "bankroll nav">
                        <a href="bankroll.php">Bankroll</a>
                    </div>
                </div>
            </div>

        <div id="middle">

<!-- Dark graphic by <a href="http://yanlu.de">Yannick</a> from <a href="http://www.flaticon.com/">Flaticon</a> is licensed under <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0">CC BY 3.0</a>. Made with <a href="http://logomakr.com" title="Logo Maker">Logo Maker</a> -->
