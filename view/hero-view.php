<?php
require "index_model.php";
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title><?= $Blog_nome ?></title>
</head>
<body>

<header>
    <h1><?= $Blog_nome ?></h1>
</header>

<main>
    <section>
        <h2>Posts</h2>

        <?php while ($linha = $result_set_posts->fetch(PDO::FETCH_ASSOC)) { ?>
            
            <article>
                <h3><?= $linha["titulo"] ?></h3>
                
                <p>
                    <strong>Data:</strong>
                    <?= date("d/m/Y", strtotime($linha["data_post"])) ?>
                </p>

                <p><?= $linha["conteudo"] ?></p>
            </article>

        <?php } ?>

    </section>
</main>

<footer>
    <?= $Blog_nome ?> - <?= $Blog_autor ?> - <?= $Blog_email_adm ?>
</footer>

</body>
</html>