<?php
if (!defined('TINYIB_BOARD')) {
	die('');
}

function truncate_to_n_line_breaks(&$input, $br_count = 15, $handle_html = TRUE) {
    // exit early if nothing to truncate
    if (substr_count($input, '<br>') <= $br_count)
        return FALSE;

    // get number of line breaks and their offsets
    $br_offsets = strallpos($input, '<br>');

    // truncate simply via line break threshold
    $input = substr($input, 0, $br_offsets[$br_count - 1]);

    // handle HTML elements in-case termination fails
    if ($handle_html) {
        $open_tags = [];

        preg_match_all('/(<\/?([\w+]+)[^>]*>)?([^<>]*)/', $input, $matches, PREG_SET_ORDER);
        foreach ($matches as $match) {
            if (preg_match('/br/i', $match[2]))
                continue;
            
            if (preg_match('/<[\w]+[^>]*>/', $match[0])) {
                array_unshift($open_tags, $match[2]);
            }
        }

        foreach ($open_tags as $open_tag) {
            $input .= '</' . $open_tag . '>';
        }
    }

    return TRUE;
}
