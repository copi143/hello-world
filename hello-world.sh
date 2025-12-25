#!/usr/bin/env bash

lang_env=${LANG:-en_US}
lang_code=${lang_env%%.*}
lang_region=${lang_code//_/-}
if [[ -f "$(dirname "$0")/i18n/${lang_region,,}.txt" ]]; then
    locale_file="${lang_region,,}.txt"
else
    locale_file="en-us.txt"
fi
texts=$(cat "$(dirname "$0")/i18n/$locale_file")
replace_text=$(echo "$texts" | head -n 1)
code_dir="$(dirname "$0")/code"

shuffle_files() {
    mapfile -t files < <(ls "$code_dir")
    files=($(printf "%s\n" "${files[@]}" | shuf))
}

shuffle_files

clear

while IFS= read -r line; do
    for ((j = 0; j < ${#line}; j++)); do
        printf "%s" "${line:$j:1}"
        sleep 0.04
    done
    printf "\n"
    sleep 0.2
done <<<"$texts"
printf "\n"

sleep 2

while true; do
    for file in "${files[@]}"; do
        code_text=$(cat "$code_dir/$file")
        code_text="${code_text//\$\$\$/$replace_text}"
        while IFS= read -r line; do
            for ((j = 0; j < ${#line}; j++)); do
                printf "%s" "${line:$j:1}"
                sleep 0.02
            done
            printf "\n"
            sleep 0.1
        done <<<"$code_text"
        sleep 1
        while IFS= read -r line; do
            printf "\033[F\033[2K"
        done <<<"$code_text"
    done
    shuffle_files
done
